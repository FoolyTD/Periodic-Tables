const knex = require("../db/connection");

// returning all data from the tables table
function list() {
  return knex("tables").select("*");
}

// inserting a new table into the tables table
function create(table) {
  return knex("tables").insert(table).returning("*");
}

// updating the reservation_id of a single table
function seatReservation(table_id, reservation_id) {
  return knex("tables")
  .select("*")
  .where({table_id})
  .update({ reservation_id: reservation_id}, "*")
}

// listing a single table from tables table
function read(table_id) {
  return knex("tables").select("*").where({ table_id }).first();
}

// updating single table to set reservation_id to null
function removeReservationId(table_id) {
  return knex("tables")
    .update({ reservation_id: null }, "*")
    .where({ table_id });
}

module.exports = {
  create,
  list,
  seatReservation,
  read,
  removeReservationId,
};
