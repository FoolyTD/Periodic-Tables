import React, { useEffect, useState } from "react";
import { useHistory, Link } from "react-router-dom";
import { listReservations } from "../utils/api";
import { previous, today, next } from "../utils/date-time";
import {
  listTables,
  freeTable,
  updateReservationStatus,
} from "../utils/apiCalls";
import ErrorAlert from "../layout/ErrorAlert";

/**
 * Defines the dashboard page.
 * @param date
 *  the date for which the user wants to view reservations.
 * @returns {JSX.Element}
 */

function Dashboard({ date }) {
  const [reservations, setReservations] = useState([]);
  const [reservationsError, setReservationsError] = useState(null);
  const [tables, setTables] = useState([]);
  const [tablesError, setTablesError] = useState(null);

  // This will be used to navigate from page to page using our history
  const history = useHistory();

  // When the page mounts, fetch tables and reservations for today and
  //    mount them to the dashboard
  useEffect(loadDashboard, [date]);

  function loadDashboard() {
    const abortController = new AbortController();

    setReservationsError(null);
    setTablesError(null);
    listReservations({ date }, abortController.signal)
      .then(setReservations)
      .catch(setReservationsError);
    listTables().then(setTables).catch(setTablesError);
    return () => abortController.abort();
  }

  // If the reservation has a status of cancelled, the dashboard should not display it
  const showReservations = () => {
    return reservations.map((reservation) => {
      if (reservation.status !== "cancelled") {
        return (
          <tr key={reservation.reservation_id}>
            <td>{reservation.last_name}</td>
            <td>{reservation.first_name}</td>
            <td>{reservation.people}</td>
            <td>{reservation.reservation_time.slice(0, 5)}</td>
            <td data-reservation-id-status={reservation.reservation_id}>
              {reservation.status}
            </td>
            {/* Only show buttons when the reservation is booked */}
            {reservation.status === "booked" && (
              <td className="d-flex justify-content-center">
                <div className="btn-group">
                  <Link to={`/reservations/${reservation.reservation_id}/seat`}>
                    <button
                      className="btn btn-outline-info btn-light"
                      type="button"
                    >
                      seat
                    </button>
                  </Link>
                  <Link to={`/reservations/${reservation.reservation_id}/edit`}>
                    <button
                      className="btn btn-outline-dark btn-light"
                      type="button"
                    >
                      edit
                    </button>
                  </Link>
                  {/* Button to cancel the reservation and remove it from the dashboard */}
                  <button
                    className="btn btn-outline-danger btn-light"
                    data-reservation-id-cancel={reservation.reservation_id}
                    onClick={() => handleCancel(reservation.reservation_id)}
                    type="button"
                  >
                    Cancel
                  </button>
                </div>
              </td>
            )}
          </tr>
        );
      } else {
        return null;
      }
    });
  };

  // Handle when the finish button it clicked
  const handleFinish = (table_id, reservation_id) => {
    const confirmation = window.confirm(
      "Is this table ready to seat new guests? This cannot be undone."
    );
    if (confirmation) {
      // change the reservation status to finished
      updateReservationStatus(reservation_id, "finished")
        // Delete the reservation ID to free up the table
        .then(freeTable(table_id).catch(setTablesError))
        // refresh changes made to tables and reservations
        .then(loadDashboard)
        .catch(setReservationsError);
    }
  };

  // cancel button asks for confirmation before making api call to update reservation status to cancelled
  const handleCancel = (reservation_id) => {
    const confirmation = window.confirm(
      "Do you want to cancel this reservation? This cannot be undone."
    );
    if (confirmation) {
      // updates reservation status to cancelled
      updateReservationStatus(reservation_id, "cancelled")
        // then, reload the dashboard
        .then(loadDashboard)
        .catch(setReservationsError);
    }
  };

  // function that diaplays the tables on the dashboard so that they can be seated
  const showTables = () => {
    return tables.map((table) => {
      return (
        <tr key={table.table_id}>
          <td>{table.table_name}</td>
          <td>{table.capacity}</td>
          <td data-table-id-status={table.table_id}>
            {table.reservation_id ? "Occupied" : "Free"}
          </td>
          {table.reservation_id && (
            <td className="d-flex justify-content-center">
              <button
                className="btn btn-outline-danger btn-warning"
                data-table-id-finish={table.table_id}
                onClick={() =>
                  handleFinish(table.table_id, table.reservation_id)
                }
                type="button"
              >
                Finish
              </button>
            </td>
          )}
        </tr>
      );
    });
  };

  return (
    <main>
      <div className="jumbotron jumbotron-fluid">
        <div className="container">
          <h1 className="display-4">Dashboard</h1>
        </div>
      </div>

      {/* Button navigation for the dashboard */}
      <div className="btn-group">
        <button
          className="btn btn-warning"
          type="button"
          onClick={() => history.push(`/dashboard?date=${previous(date)}`)}
        >
          Previous
        </button>
        <button
          className="btn btn-primary"
          type="button"
          onClick={() => history.push(`/dashboard?date=${today()}`)}
        >
          Today
        </button>
        <button
          className="btn btn-success"
          type="button"
          onClick={() => history.push(`/dashboard?date=${next(date)}`)}
        >
          Next
        </button>
      </div>

      <hr></hr>

      {/* Breadcrum header for reservation date */}
      <div className="">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <h2>Reservations for: {date}</h2>
            </li>
          </ol>
        </nav>
      </div>

      {/* Displays the reservations */}
      <div>
        <table className="table table-bordered">
          <thead>
            <tr>
              <th scope="col">Last Name</th>
              <th scope="col">First Name</th>
              <th scope="col">Party</th>
              <th scope="col">Reservation Time</th>
              <th scope="col">Status</th>
              <th scole="col">Action</th>
            </tr>
          </thead>
          <tbody>{showReservations()}</tbody>
        </table>
      </div>

      <hr></hr>

      {/* Breadcrum header for the tables table */}
      <div>
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <h2>Tables</h2>
            </li>
          </ol>
        </nav>
      </div>

      {/* Displays the table in a table :) */}
      <div>
        <table className="table table-bordered">
          <thead>
            <tr>
              <th scope="col">Table Name</th>
              <th scope="col">Capacity</th>
              <th scope="col">Status</th>
              <th scope="col">Finish</th>
            </tr>
          </thead>
          <tbody>{showTables()}</tbody>
        </table>
      </div>

      {/* Display errors if fetch fails */}
      <ErrorAlert error={reservationsError} />
      <ErrorAlert error={tablesError} />
    </main>
  );
}

export default Dashboard;
