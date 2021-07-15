/**
 * List handler for reservation resources
 */
const service = require("./tables.service");
const reservationsService = require("../reservations/reservations.service");

//////////////////////////////////////////////////////////////////
///                 MIDDLEWARE PIPELINE                      ////
////////////////////////////////////////////////////////////////

// Checking to see if a table exists and placing it in res.locals object
async function tableExists(req, res, next) {
  const table = await service.read(req.params.table_id);

  if (table === undefined) {
    return next({
      status: 404,
      message: `table ${req.params.table_id} does not exist`,
    });
  }
  res.locals.table = table;
  return next();
}

// Checking if the table is already seated with a reservation_id
function tableHasReservationId(req, res, next) {
  const table = res.locals.table;

  if (table.reservation_id) {
    return next();
  }
  next({
    status: 400,
    message: "This table is not occupied",
  });
}

// validating the data to creat a new table in the database
function tableValidation(req, res, next) {
  const { data } = req.body;

  if (data === undefined) {
    return next({
      status: 400,
      message: "request is missing data",
    });
  }
  if (
    data.table_name === undefined ||
    data.table_name.trim() === "" ||
    data.table_name.length < 2
  ) {
    return next({
      status: 400,
      message: "table_name is missing",
    });
  }
  if (data.capacity === undefined) {
    return next({
      status: 400,
      message: "capacity is missing",
    });
  }
  if (data.capacity < 1) {
    return next({
      status: 400,
      message: "capacity cannot be less than 1",
    });
  }
  if (typeof data.capacity !== "number") {
    return next({
      status: 400,
      message: "capacity must be a number",
    });
  }
  res.locals.table = data;
  next();
}

async function seatingValidation(req,res,next) {
  const { data } = req.body;
  const { table } = res.locals;

  if (data === undefined) {
    return next({
      status: 400,
      message: "request is missing valid body"
    })
  }
  if (table.reservation_id) {
    return next({
      status: 400,
      message: `Table ${table.table_id} is already occupied`,
    });
  }
  if (data.reservation_id === undefined) {
    return next({
      status: 400,
      message: "reservation_id is missing"
    })
  }

  const { reservation_id } = req.body.data;

  const reservation = await reservationsService.read(reservation_id);
  
  if (reservation === undefined) {
    return next({
      status: 404,
      message: `we cannot find a reservation with an id of ${reservation_id}`,
    });
  }
  if (reservation.status === "seated") {
    return next({
      status: 400,
      message: `this reservation is already seated`,
    });
  }
  if (table.capacity < reservation.people) {
    return next({
      status: 400,
      message: "this table does not have the capacity to seat this reservation"
    })
  }
  
  res.locals.reservation_id = reservation_id;
  next()
}

//////////////////////////////////////////////////////////////////
/////                     CRUD OPERATIONS                    ////
////////////////////////////////////////////////////////////////

async function list(req, res, next) {
  const tablesList = await service.list();
  tablesList.sort((a, b) => a.table_name.localeCompare(b.table_name));

  res.json({ data: tablesList });
}

async function create(req, res, next) {
  const data = await service.create(req.body.data);
  res.status(201).json({ data: data[0] });
}

async function seatReservation(req, res, next) {
  const { table, reservation_id } = res.locals;

  const data = await service.seatReservation(table.table_id, reservation_id);

  if (data) {
    const reservationData = await reservationsService.updateReservationStatus(
      Number(reservation_id),
      "seated"
    );
    if (reservationData) {
      return res.json({ data });
    }
  } else {
    return next({
      status: 400,
      message: "there was an error updating your reservation",
    });
  }
}

async function read(req, res, next) {
  res.json({ data: res.locals.table });
}

async function removeReservationId(req, res) {
  const { table } = res.locals;
  const reservation_id = table.reservation_id;

  const reservationRemoved = await service.removeReservationId(table.table_id);
  if (reservationRemoved) {
    const updatedReservationStatus =
      await reservationsService.updateReservationStatus(
        reservation_id,
        "finished"
      );
      if (updatedReservationStatus) {
        return res.send({}).status(200);
      }
  } else {
    return next({
      status: 400,
      message: "an error occured removing reservation_id from the table"
    })
  }
}

module.exports = {
  create: [tableValidation, create],
  list,
  read: [tableExists, read],
  removeReservationId: [
    tableExists,
    tableHasReservationId,
    removeReservationId,
  ],
  seatReservation: [tableExists, seatingValidation, seatReservation],
};
