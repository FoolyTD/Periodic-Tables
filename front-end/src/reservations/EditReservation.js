import React, { useState, useEffect } from "react";
import { listReservation, updateReservation } from "../utils/apiCalls";
import ErrorAlert from "../layout/ErrorAlert";
import { useHistory, useParams } from "react-router-dom";

export default function EditReservation() {
  // Initialize the form with the reservation data
  const [errors, setErrors] = useState(null);
  const [reservation, setReservation] = useState([]);
  const [reservationError, setReservationError] = useState(null);
  const [updateError, setUpdateError] = useState(null);
  const { reservationId } = useParams();
  const history = useHistory();
  const [formData, setFormData] = useState({});

  // When the page mounts, get the reservation information to fill the form
  useEffect(() => {
    const abortController = new AbortController();
    listReservation(reservationId, abortController.signal)
      .then(setReservation)
      .then((reservation) => setFormData)
      .catch(setReservationError);
    return () => {};
  }, [reservationId]);

  // Display any errors with form validation
  const displayErrors = () => {
    return errors.map((error, index) => {
      return <ErrorAlert key={`error-${index}`} error={error} />;
    });
  };

  // Display any errors with form validation
  const displayReservationErrors = () => {
    return reservationError.map((error, index) => {
      return <ErrorAlert key={`error-${index}`} error={error} />;
    });
  };

  // Display any errors with form validation
  const displayUpdateErrors = () => {
    return updateError.map((error, index) => {
      return <ErrorAlert key={`error-${index}`} error={error} />;
    });
  };

  // Validate the date & time of the reservation update
  const dateValidation = () => {
    const errors = [];
    const today = new Date();
    const reservationDate = new Date(formData.reservation_date);
    const reservationTime = formData.reservation_time;

    // Timezone was off so 1 equals tuesday in my code
    if (reservationDate.getDay() === 1) {
      errors.push({ message: "We are closed on Tuesdays" });
    }
    if (reservationDate < today) {
      errors.push({ message: "Reservations cannot be made in the past" });
    }
    if (reservationTime.localeCompare("10:30") === -1) {
      errors.push({ message: "We are closed before 10:30AM" });
    } else if (reservationTime.localeCompare("21:30") === 1) {
      errors.push({ message: "We are closed after 9:30PM" });
    } else if (reservationTime.localeCompare("21:00") === 1) {
      errors.push({
        message: "You must book at least 30 minutes before store closes",
      });
    }
    setErrors(errors);
    if (errors.length > 0) {
      return false;
    }
    return true;
  };

  // Update the form with user inputs
  const handleChange = ({ target }) => {
    // API call was not working because the party size was being passed in as a string
    //  I convert the string into a number
    const value =
      target.name === "people" ? Number(target.value) : target.value;
    setFormData({
      ...formData,
      [target.name]: value,
    });
  };

  // if the user wants to submit, make sure they confirm first
  const handleSubmit = async (event) => {
    event.preventDefault();

    // Update the existing reservation fields with the input from the form
    Object.entries(formData).forEach((update) => {
      reservation[update[0]] = update[1];
    });

    // Make sure that the reservation date and time will be accepted by the API
    // if they are not changed
    reservation.reservation_date = reservation.reservation_date.slice(0, 10);
    reservation.reservation_time = reservation.reservation_time.slice(0, 5);

    if (formData.reservation_date) {
      if (dateValidation()) {
        //On submit we want to update the reservation
        //createReservation(formData);
        await updateReservation(reservationId, reservation)
          .then(() =>
            history.push(`/dashboard?date=${reservation.reservation_date}`)
          )
          .catch(setUpdateError);
      }
    } else {
      await updateReservation(reservationId, reservation)
        .then(() =>
          history.push(`/dashboard?date=${reservation.reservation_date}`)
        )
        .catch(setUpdateError);
    }
  };

  return (
    <div>
      <div className="mb-3">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <h2>Editing Reservation: {reservationId}</h2>
            </li>
          </ol>
        </nav>
      </div>

      {/* Update reservation form */}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">
            First Name:
            <input
              className="form-control"
              type="text"
              name="first_name"
              placeholder={reservation.first_name}
              value={formData.first_name && formData.first_name}
              onChange={handleChange}
            />
          </label>
        </div>

        <div className="mb-3">
          <label className="form-label">
            Last Name:
            <input
              className="form-control"
            type="text"
            name="last_name"
            placeholder={reservation.last_name}
            value={formData.last_name && formData.last_name}
            onChange={handleChange}
          />
        </label>
        </div>

        <div className="mb-3">
          <label className="form-label">
            Mobile Number:
            <input
              className="form-control"
            type="tel"
            name="mobile_number"
            placeholder={reservation.mobile_number}
            value={formData.mobile_number && formData.mobile_number}
            onChange={handleChange}
          />
        </label>
        </div>

        <div className="mb-3">
          <label className="form-label">
            Date of Reservation:
            <input
              className="form-control"
            type="date"
            name="reservation_date"
            placeholder={reservation.reservation_date}
            value={formData.reservation_date && formData.reservation_date}
            onChange={handleChange}
          />
        </label>
        </div>

        <div className="mb-3">
          <label className="form-label">
            Time of Reservation:
            <input
              className="form-control"
            type="time"
            name="reservation_time"
            placeholder={reservation.reservation_time}
            value={formData.reservation_time && formData.reservation_time}
            onChange={handleChange}
          />
        </label>
        </div>

        <div className="mb-3">
          <label className="form-label">
            Party Size:
            <input
              className="form-control"
            type="number"
            name="people"
            placeholder={reservation.people}
            value={formData.people && formData.people}
            onChange={handleChange}
          />
        </label>
        </div>

        {/* Submit and cancel buttons */}
        <div className="btn-group">
          <button className="btn btn-primary" type="submit" name="submit">
            Submit
          </button>
          <button
            className="btn btn-warning"
            type="button"
            onClick={() => history.goBack()}
            name="cancel"
          >
            Cancel
          </button>
        </div>
      </form>

      {/* Display errors */}
      {errors && displayErrors()}
      {reservationError && displayReservationErrors()}
      {updateError && displayUpdateErrors()}
    </div>
  );
}
