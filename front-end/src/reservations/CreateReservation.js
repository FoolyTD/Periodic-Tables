import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import ErrorAlert from "../layout/ErrorAlert";
import { createReservation } from "../utils/apiCalls";

export default function CreateReservation() {
  // Initialize state for the formData and the errors that may occur
  //    with form validation
  const initialForm = {
    first_name: "",
    last_name: "",
    mobile_number: "",
    reservation_date: "",
    reservation_time: "",
    people: "",
  };
  const [errors, setErrors] = useState(null);
  const [formData, setFormData] = useState({ ...initialForm });
  const history = useHistory();

  // Change handler will update formdata when user inputs their data
  const handleChange = ({ target }) => {
    // API call was not working because the party size was being passed in as a string
    //    I convert the string to a number
    const value =
      target.name === "people" ? Number(target.value) : target.value;
    setFormData({
      ...formData,
      [target.name]: value,
    });
  };

  // Validation function for the date
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
    
    // Put any erros in the state to be rendered
    setErrors(errors);
    if (errors.length > 0) {
      return false;
    }
    return true;
  };

  // Function to display errors to the dashboard
  const displayErrors = () => {
    return errors.map((error, index) => {
      return <ErrorAlert key={`error-${index}`} error={error} />;
    });
  };

  // Validate the form data and then submit an post to create new reservation 
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (dateValidation()) {
      // On submit we want to create the reservation
      createReservation(formData);
      history.push(`/dashboard?date=${formData.reservation_date}`);
    }
  };

  return (
    <div>

      <div className="mb-3">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <h2>Create New Reservation</h2>
            </li>
          </ol>
        </nav>
      </div>

      {/* New reservation form */}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">
            First Name:
            <input
              className="form-control"
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              required
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
              value={formData.last_name}
              required
              onChange={handleChange}
            />
          </label>
        </div>

        <div className="mb-3">
          <label className="form-label">
            Mobile Number:
            <input
              className="form-control"
              required
              type="tel"
              name="mobile_number"
              value={formData.mobile_number}
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
              value={formData.reservation_date}
              onChange={handleChange}
              required
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
              value={formData.reservation_time}
              onChange={handleChange}
              required
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
              value={formData.people}
              onChange={handleChange}
              required
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

      {/* Display erros if any are present */}
      {errors && displayErrors()}
    </div>
  );
}
