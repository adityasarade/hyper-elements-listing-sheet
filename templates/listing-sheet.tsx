import { prop } from "@hyper-elements/react";
import { template } from "@hyper-elements/react/template";
import FinchLoweListingSheet, { COUNCIL_BANDS, HINGES, ROOM_KINDS, SWINGS, WALL_SIDES, ropewalk } from "../src/finch-lowe-listing-sheet";

const text = (label: string, maxLength: number, guidance: string) =>
  prop.text({ label, maxLength, guidance, required: true });

const number = (label: string, min: number, max: number, guidance: string) =>
  prop.number({ label, min, max, guidance, required: true });

const opening = {
  room: text("Room name", 22, "Use the exact name from the Rooms list. List each opening only once."),
  wall: prop.choice(WALL_SIDES, { label: "Room wall", required: true }),
  offset: number("Offset (m)", 0.05, 15, "Measure from the left end of a north or south wall, or the top end of an east or west wall."),
  width: number("Opening width (m)", 0.4, 5, "Leave at least 0.05 m of wall at either end."),
};

export default template({
  id: "finchlowe.ListingSheet",
  version: "1.0.0",
  label: "Finch & Lowe property listing sheet",
  guidance: "Fill one home on one level. Draw it as named, non-overlapping rectangles in metres with north at the top. Use the same values for A4 and Letter.",
  root: "Document",
  formats: { a4: { size: "A4" }, letter: { size: "Letter" } },
  fields: {
    reference: text("Listing reference", 16, "Use the reference from your agency records."),
    address: text("Main address", 42, "Put the flat number and building name here."),
    street: text("Street address", 38, "Include the street number."),
    town: text("Town", 26, "Use the postal town."),
    price: number("Price (GBP)", 1, 25000000, "Give a whole-pound asking price or monthly rent."),
    basis: prop.choice(["sale", "rent"], { label: "Sale or rent", required: true }),
    floor: text("Floor", 14, "Use a short label such as Ground, First or Second."),
    tenure: text("Tenure", 20, "Use a short description such as Leasehold or Assured tenancy."),
    councilTax: prop.choice(COUNCIL_BANDS, { label: "Council tax band", required: true }),
    bedrooms: number("Bedrooms", 0, 6, "Count the bedroom rectangles. Use 0 for a studio."),
    bathrooms: number("Bathrooms", 0, 5, "Count the bathroom rectangles."),
    description: prop.list(text("Paragraph", 220, "Keep each paragraph short enough to read at a viewing."),
      { label: "Description", required: true, min: 2, max: 2 }),
    features: prop.list(text("Feature", 38, "Use a short phrase with one fact."),
      { label: "Key features", required: true, min: 1, max: 8 }),
    rooms: prop.list(prop.object({
      name: text("Room name", 22, "Give every room a unique, short name."),
      kind: prop.choice(ROOM_KINDS, { label: "Room type", required: true }),
      x: number("West edge x (m)", 0, 16, "Distance east from the plan origin."),
      y: number("North edge y (m)", 0, 16, "Distance south from the plan origin."),
      width: number("East–west width (m)", 0.8, 16, "Use the measured interior width."),
      depth: number("North–south depth (m)", 0.8, 16, "Use the measured interior depth."),
    }, { label: "Room", required: true }), {
      label: "Rooms", required: true, min: 1, max: 9,
      guidance: "Give adjacent rooms a shared edge. Keep the finished footprint within 16 m east–west and 16 m north–south.",
    }),
    doors: prop.list(prop.object({
      ...opening,
      width: number("Door leaf width (m)", 0.4, 1.6, "Give the width of one swinging leaf and leave at least 0.05 m of wall at either end."),
      hinge: prop.choice(HINGES, { label: "Hinge", required: true, guidance: "Start is left on a horizontal wall and top on a vertical wall." }),
      swing: prop.choice(SWINGS, { label: "Swing", required: true, guidance: "In opens into the named room. Out opens away from it." }),
    }, { label: "Door", required: true }), { label: "Doors", max: 16 }),
    windows: prop.list(prop.object(opening, { label: "Window", required: true }), {
      label: "Windows", max: 24, guidance: "Place windows only on the exposed part of an outside wall.",
    }),
    epcCurrent: number("Current EPC score", 1, 100, "Copy the whole-number score from the current certificate."),
    epcPotential: number("Potential EPC score", 1, 100, "Copy the whole-number potential score from the same certificate."),
    agent: text("Viewing contact", 36, "Give the name of the person handling appointments."),
    phone: prop.text({
      label: "UK phone number", required: true, maxLength: 18, pattern: "^0(?: ?[0-9]){10}$",
      guidance: "Use the UK national number with its leading 0. Spaces are allowed.",
    }),
    email: prop.text({
      label: "Agency email address", required: true, maxLength: 46, pattern: "^[a-zA-Z0-9._+-]+@finchandlowe\\.example$",
      guidance: "Use a named mailbox at finchandlowe.example.",
    }),
    viewings: text("Viewing times", 105, "Give an appointment window and any booking instructions."),
  },
  rules: {
    require: { core: ["layout/overflow", "document/overflow"] },
    root: { lang: true },
    links: { domains: ["finchandlowe.example"], schemes: ["mailto", "tel"] },
  },
  example: ropewalk,
  render(v, { format }) {
    return FinchLoweListingSheet({
      size: format === "letter" ? "Letter" : "A4",
      values: { ...v, description: [v.description[0], v.description[1]] },
    });
  },
});
