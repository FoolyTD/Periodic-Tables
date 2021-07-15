import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import ErrorAlert from "../layout/ErrorAlert";
import { createTable } from "../utils/apiCalls";

export default function CreateTable() {
  const [errors, setErrors] = useState(null);
  const initialForm = {
    table_name: "",
    capacity: "",
  };
  const [formData, setFormData] = useState({ ...initialForm });
  const history = useHistory();

  // update form data as the form is filled out
  const handleChange = ({ target }) => {
    // Must convert the capacity from string to number to pass backend acceptance criteria
    const value =
      target.name === "capacity" ? Number(target.value) : target.value;
    setFormData({
      ...formData,
      [target.name]: value,
    });
  };

  // tables less than 1 or single character names are prohibited
  const validateData = () => {
    const errors = [];
    if (formData.capacity < 1) {
      errors.push({ message: "Capacity must be 1 or greater" });
    }
    if (formData.table_name.length < 2) {
      errors.push({ message: "Table name must be greater than 1 character" });
    }
    setErrors(errors);
    if (errors.length > 0) {
      return false;
    }
    return true;
  };

  // send put request to backend to create table
  const handleSubmit = (event) => {
    event.preventDefault();
    if (validateData()) {
      createTable(formData);
      history.push(`/dashboard`);
    }
  };

  // capture erros and display them
  const displayErrors = () => {
    return errors.map((error, index) => {
      return <ErrorAlert key={`error-${index}`} error={error} />;
    });
  };

  return (
    <div>
      <div className="mb-3">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <h2>Create New Table</h2>
            </li>
          </ol>
        </nav>
      </div>

      {/* Form to create a new table */}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">
            Table Name:
            <input
              className="form-control"
              type="text"
              name="table_name"
              value={formData.table_name}
              onChange={handleChange}
              required
            />
          </label>
        </div>

        <div className="mb-3">
          <label className="form-label">
            Capacity:
            <input
              className="form-control"
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              required
            />
          </label>
        </div>

        <div className="button-group">
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
      {errors && displayErrors()}
    </div>
  );
}
