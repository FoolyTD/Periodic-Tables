import React, { useState, useEffect } from "react";
import CreateReservation from "../reservations/CreateReservation";
import CreateTable from "../tables/createTable";
import { Redirect, Route, Switch } from "react-router-dom";
import Dashboard from "../dashboard/Dashboard";
import NotFound from "./NotFound";
import { today } from "../utils/date-time";
import useQuery from "../utils/useQuery";
import SeatReservation from "../reservations/SeatReservation";
import { listTables } from "../utils/apiCalls";
import Search from "../reservations/Search";
import EditReservation from "../reservations/EditReservation";

/**
 * Defines all the routes for the application.
 *
 * You will need to make changes to this file.
 *
 * @returns {JSX.Element}
 */
function Routes() {
  const [reservations, setReservations] = useState([]);
  const [reservationsError, setReservationsError] = useState(null);
  const [tables, setTables] = useState([]);
  const [tableId, setTableId] = useState(null);

  useEffect(loadTables, [tableId]);

  function loadTables() {
    const abortController = new AbortController();

    listTables()
      .then(setTables)
      .catch(()=>{});
    return () => abortController.abort();
  }

  const query = useQuery();
  const date = query.get("date");
  return (
    <Switch>
      <Route exact={true} path="/">
        <Redirect to={"/dashboard"} />
      </Route>
      <Route exact={true} path="/reservations">
        <Redirect to={"/dashboard"} />
      </Route>
      <Route exact={true} path="/reservations/:reservationId/seat">
        <SeatReservation
          tables={tables}
          loadTables={loadTables}
          tableId={tableId}
          setTableId={setTableId}
          reservations={reservations}
          setReservations={setReservations}
        />
      </Route>
      <Route exact={true} path="/reservations/:reservationId/edit">
        <EditReservation />
      </Route>
      <Route exact={true} path="/reservations/new">
        <CreateReservation />
      </Route>
      <Route path="/dashboard">
        <Dashboard
          date={date ? date : today()}
          reservations={reservations}
          setReservations={setReservations}
          reservationsError={reservationsError}
          setReservationsError={setReservationsError}
        />
      </Route>
      <Route path="/tables/new">
        <CreateTable />
      </Route>
      <Route exact={true} path="/search">
        <Search />
      </Route>
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

export default Routes;
