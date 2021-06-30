/**
 * Defines the router for reservation resources.
 *
 * @type {Router}
 */

const router = require("express").Router();
const controller = require("./reservations.controller");

router.route("/:reservation_Id/status").put(controller.updateReservationStatus);

router.route("/all").get(controller.listAll);

router.route("/:reservation_Id").get(controller.read).put(controller.updateReservation);

router.route("/").get(controller.list).post(controller.create);

module.exports = router;
