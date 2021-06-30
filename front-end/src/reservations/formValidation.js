import { today } from "../utils/date-time";
export default function isValid({
    first_name,
    last_name,
    mobile_number,
    reservation_date,
    reservation_time,
    people,
}) {
    const errors = {};
    if(first_name.length < 1 || first_name.trim() === '') {
        return errors[first_name] = "First name is required";
    }
    if(last_name.length < 1 || last_name.trim() === '') {
        return errors[last_name] = "Last name is required";
    }
    if(mobile_number.length !== 12) {
        return errors[mobile_number] = "Mobile number incorrect format. Please use (###-###-####) format";
    }
    if (reservation_date < today()) {
        return errors[reservation_date] = "Reservation date invalid";
    }
    if (reservation_time < Date.now()) {
        return errors[reservation_time] = "invalid reservation time";
    }
    if(people < 1) {
        return errors[people] = "Party size invalid";
    }
   return true;
}