import { Link } from "react-router-dom";
import React, { useState } from "react";
import { listReservations } from "../utils/api";
import { updateReservationStatus } from "../utils/apiCalls";
import ErrorAlert from "../layout/ErrorAlert";

export default function Search() {
  // Initialize the form as empty and create state to hold form data and
  //     store the reservations that will return from search
  const initialFormState = { mobile_number: "" };
  const [formData, setFormData] = useState({ ...initialFormState });
  const [ranSearch, setRanSearch] = useState(false);
  const [foundReservations, setFoundReservations] = useState([]);
  const [foundReservationsError, setFoundReservationsError] = useState(null);
  const [updateError, setUpdateError] = useState(null);

  // When "Find" button is clicked, make API call to return reservations
  const handleSearch = (event) => {
    const abortController = new AbortController();
    event.preventDefault();

    // set ranSearch to true display no results found if no errors
    setRanSearch(true);

    listReservations(
      { mobile_number: formData.mobile_number },
      abortController.signal
    )
      .then(setFoundReservations)
      .catch(setFoundReservationsError);
  };

  // Update the form data when user types
  const handleChange = ({ target }) => {
    const value = target.value;
    setFormData({
      ...formData,
      [target.name]: value,
    });
  };

  // Display errors retrieved by the fetch call
  const displayErrors = () => {
    return foundReservationsError.map((error, index) => {
      return <ErrorAlert key={`error-${index}`} error={error} />;
    });
  };

  // Cancel button asks for confirmation before making api call to update reservation status to cancelled
  const handleCancel = (reservation_id) => {
    const confirmation = window.confirm(
      "Do you want to cancel this reservation? This cannot be undone."
    );
    if (confirmation) {
      const abortController = new AbortController();
      // updates reservation status to cancelled
      updateReservationStatus(reservation_id, "cancelled")
        // reload the dashboard
        .then(
          listReservations(
            { mobile_number: formData.mobile_number },
            abortController.signal
          )
            .then(setFoundReservations)
            .catch(setFoundReservationsError)
        )
        .catch(setUpdateError);
    }
  };

  // Display the found reservations that match phone number
  const displayFoundReservations = () => {
    return foundReservations.map((reservation) => {
      return (
        <tr key={reservation.reservation_id}>
          <td>{reservation.last_name}</td>
          <td>{reservation.first_name}</td>
          <td>{reservation.people}</td>
          <td>{reservation.reservation_time.slice(0, 5)}</td>
          <td>{reservation.reservation_date}</td>
          <td data-reservation-id-status={reservation.reservation_id}>
            {reservation.status}
          </td>
          {/* Only show buttons when the reservation is booked */}
          {reservation.status === "booked" && (
            <td className="d-flex justify-content-center">
              {/* <div className="btn-group"> */}
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
              {/* </div> */}
            </td>
          )}
        </tr>
      );
    });
  };

  return (
    <div>
      <div className="mb-3">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <h2>Search Reservation</h2>
            </li>
          </ol>
        </nav>
      </div>

      <form onSubmit={handleSearch}>
        <div className="mb-3">
          <label className="form-label">
            Enter Mobile Number:
            <input
              className="form-control"
              type="text"
              name="mobile_number"
              value={formData.mobile_number}
              onChange={handleChange}
              required
            />
          </label>
        </div>

        <button
          className="btn btn-outline-info btn-light"
          type="submit"
          name="submit"
        >
          Find
        </button>
      </form>

      <hr></hr>

      <div>
        <h4>Reservations</h4>
      </div>

      {/* Notify user if there are no reservations matching the phone number */}
      {foundReservations.length === 0 && ranSearch === true && (
        <ErrorAlert error={{ message: "No Reservations found" }} />
      )}

      {updateError && displayErrors()}

      {/* Displays the reservations */}
      <div>
        <table className="table table-bordered">
          <thead>
            <tr>
              <th scope="col">Last Name</th>
              <th scope="col">First Name</th>
              <th scope="col">Party</th>
              <th scope="col">Reservation Time</th>
              <th scope="col">Reservation Date</th>
              <th scope="col">Status</th>
              <th scole="col">Action</th>
            </tr>
          </thead>
          <tbody>{displayFoundReservations()}</tbody>
        </table>
      </div>
    </div>
  );
}
