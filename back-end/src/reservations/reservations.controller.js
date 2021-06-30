/**
 * List handler for reservation resources
 */
const service = require("./reservations.service");

//////////////////////////////////////////////////
/////          MIDDLEWARE PIPELINE          /////
////////////////////////////////////////////////

// checking if a reservation exists and placing it in the res.locals object //
async function reservationExists(req,res,next) {
  const { reservation_Id } = req.params;
  const reservation = await service.read(reservation_Id);

  if(reservation === undefined) {
    return next({
      status: 404,
      message: `reservation with an id of ${reservation_Id} does not exist` 
    });
  }
  res.locals.reservation = reservation;
  next()
}

// validating the fields on an incoming request to create a reservation //
function hasValidProperties(req, res, next) {
  const { data = {} } = req.body;
  // setting all incoming reservations' status to booked
  if (data.status === undefined) {
    data.status = "booked";
  }
  if (data.first_name === undefined || data.first_name === "") {
    return next({
      status: 400,
      message: "invalid first_name",
    });
  }
  if (data.last_name === undefined || data.last_name === "") {
    return next({
      status: 400,
      message: "invalid last_name",
    });
  }
  if (data.mobile_number === undefined || data.mobile_number === "") {
    return next({
      status: 400,
      message: "invalid mobile_number",
    });
  }
  if (data.reservation_date === undefined || data.reservation_date === "") {
    return next({
      status: 400,
      message: "invalid reservation_date",
    });
  }
  if (data.reservation_time === undefined || data.reservation_time === "") {
    return next({
      status: 400,
      message: "invalid reservation_time",
    });
  }
  if (data.people === undefined || data.people === 0 || typeof(data.people) != "number") {
    return next({
      status: 400,
      message: "invalid number of people",
    });
  }
  if (data.reservation_time.length !== 5) {
    return next({
      status: 400,
      message: "invalid reservation_time",
    });
  }
  if (data.reservation_date.slice(4,5) != "-") {
    return next({
      status: 400,
      message: "invalid reservation_date",
    });
  }
  if (data.status !== "booked") {
    return next({
      status: 400,
      message: `invalid reservation status: ${data.status} reservations can only be made with the status of booked`,
    });
  }

  res.locals.reservation = data;
  next();
}

// validating the date is not in the past or on a Tuesday //
function dateIsValid(req,res,next) {
  const { reservation_date } = req.body.data;
  const reservation = new Date(reservation_date);
  const today = new Date();

  if (reservation < today) {
    return next({
      status: 400,
      message: "Reservation must be in the future"
    })
  }
  if (reservation.getDay() === 1) {
    return next({
      status: 400,
      message: "we are closed on Tuesdays"
    })
  }
  next();
}

// validating reservation time is within store operating hours //
function timeIsValid(req, res, next) {
  const { reservation_time } =  req.body.data;
  
  if (reservation_time.localeCompare("10:30") === -1) {
    next({
      status: 400,
      message: "Store closed before 10:30AM"
    });      
  } else if(reservation_time.localeCompare("21:30") === 1) {
    next({
      status: 400,
      message: "Store closed after 09:30PM"
    });
  } else if(reservation_time.localeCompare("21:00") === 1 ) {
    next({
      status: 400,
      message: "You must book at least 30 minutes before store closes"
    });
  }
  next();
}

/////////////////////////////////////////////////////////////////////////////
/////                         CRUD OPERATIONS                         //////
///////////////////////////////////////////////////////////////////////////

// List reservations on a given date //
async function list(req, res) {
  const date = req.query.date;
  const mobile_number = req.query.mobile_number;

  // if there is a date in the query string, search by date
  if (date) {
  const rawData = await service.list(date);
  // remove reservations with a status of finished
  const data = rawData.filter((reservation)=>reservation.status !== "finished");
  data.sort((a, b) => a.reservation_time.localeCompare(b.reservation_time));
  return res.json({data});  
  }
  
  // if there is a mobile_number, search by mobile number
  if(mobile_number) {
  const data = await service.search(mobile_number);
  return res.json({data})
  }
  
}

// Create a new reservation //
async function create(req, res, next) {
  const data = await service.create(res.locals.reservation);
  res.status(201).json({ data: data[0] });
}

// List all reservation in the reservations table //
async function listAll(req,res,next) {
  const data = await service.listAll();
  res.json({data});
}

// Get a single reservation by it's reservation_id //
async function read(req,res,next) {
  res.json({ data: res.locals.reservation });
}

// Update the status field on an existing reservation //
async function updateReservationStatus(req,res,next) {
  const { status } = req.body.data;
  const reservation = res.locals.reservation;

  if (reservation.status === "finished") {
    return next({
      status: 400,
      message: "cannot update a finished reservation"
    })
  }
  // return a 200 if reservation is cancelled
  if (status === "cancelled") {
    const data = await service.updateReservationStatus(reservation.reservation_id, status);
    return res.status(200).json({data: data[0]});
  }
  if (status === "finished" || status === "seated" || status === "booked") {
    const data = await service.updateReservationStatus(reservation.reservation_id, status);
    return res.json({data: data[0]});
  }
  return next({
    status: 400,
    message: `reservation status "${status}" is prohibited on this reservation`
  })
}

// Update multiple fields on an existing reservation
async function updateReservation(req, res, next) {
  const updatedReservation = {
    ...req.body.data,
    reservation_id: Number(req.params.reservation_Id)
  }
  console.log(updatedReservation);
  const data = await service.updateReservation(updatedReservation);
  res.json({ data });
}

module.exports = {
  list,
  create: [hasValidProperties, dateIsValid, timeIsValid, create],
  read: [reservationExists, read],
  listAll,
  reservationExists,
  updateReservationStatus: [reservationExists, updateReservationStatus],
  updateReservation: [reservationExists, hasValidProperties, dateIsValid, timeIsValid, updateReservation]
};
