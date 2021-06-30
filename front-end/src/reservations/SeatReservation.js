import { useParams, useHistory } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  listReservation,
  seatReservation,
  listTables
} from "../utils/apiCalls";
import ErrorAlert from "../layout/ErrorAlert";

export default function SeatReservation({
  tableId,
  setTableId,
}) {
  const [tablesError, setTablesError] = useState(null);
  const [reservation, setReservation] = useState([]);
  const [reservationError, setReservationError] = useState(null);
  const [submissionError, setSubmissionError] = useState(null);
  const [availableTables, setAvailableTables] = useState([]);
  const { reservationId } = useParams();
  const history = useHistory();

  // Load the reservation data once the page mounts,
  //    this data will be used to validate seating capacity
  useEffect(loadReservationData, [reservationId]);
  useEffect(()=> {
    const abortController = new AbortController();
    
    setTablesError(null);
    listTables(abortController.signal)
    .then(setAvailableTables)
    .catch(setTablesError);

    return ()=> abortController.abort;
  }, [])

  // Make an api call to database and set the reservation data to
  //    match using the reservationId from the route parameters
  //    (Remember this is running asyncronously) 
  function loadReservationData() {
    const abortController = new AbortController();
    setReservationError(null);
    listReservation(reservationId)
      .then(setReservation)
      .catch(setReservationError);
    return () => abortController.abort();
  }

  // use available tables to display options
  const listTableOptions = () => {
    return availableTables.map((table) => {
      return (
        <option
          key={table.table_id}
          value={table.table_id}
          capacity={table.capacity}
        >
          {table.table_name} | Capacity: {table.capacity}
        </option>
      );
    });
  };

  // update table id to current selected table
  const handleChange = async ({ target: { value } }) => {
    await setTableId((currentValue) => (currentValue = value));
  };

  // make a put request to endpoint /tables/:table_id/seat, when tables are seated
  const handleSubmit = (event) => {
    event.preventDefault();
    // If the validations are correct, then seat the reservation and change the
    //    status so seated
      seatReservation(reservationId, tableId)
      .then(()=>history.push(`/dashboard`))
      .catch(setSubmissionError)
  };

  return (
    <div>

      <div className="mb-3">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <h2>Seat Reservation {reservationId} - People: {reservation.people}</h2>
            </li>
          </ol>
        </nav>
      </div>

      <form onSubmit={handleSubmit}>

        <div className="my-3">
        <label className="">
          Table: {} 
          <select className="form-select form-select-lg mb-3" onChange={handleChange} name="table_id" required>
            <option key={0} value={null}>
              --Select Table--
            </option>
            {listTableOptions()}
          </select>
        </label>
        </div>
        
        {/* Buttons for submit & cancel */}

        <div className="btn-group">
        <button className="btn btn-primary" type="submit" name="submit">
          Submit
        </button>
        <button className="btn btn-warning" type="button" onClick={() => history.goBack()} name="cancel">
          Cancel
        </button>
        </div>
      </form>
      <ErrorAlert error={submissionError} />
      <ErrorAlert error={tablesError} />
      <ErrorAlert error={reservationError} />
    </div>
  );
}
