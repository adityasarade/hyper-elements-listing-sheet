/**
 * Finch & Lowe, a fictional estate agency in Saltmere, hands out this sheet at viewings. The flat's
 * measurements draw the floor plan, set its scale and add up to the area shown beside the address.
 *
 * Warm paper and slate ink borrow from a surveyor's drawing. Newsreader gives the address room to
 * breathe, Hanken Grotesk carries the particulars, and DM Mono keeps the measurements distinct.
 */
import { Circle, Column, Document, Heading, Layer, Line, LineBreak, Link, PageFooter, PageNumber, Path, Polygon, Rect, Row, Span, Svg, Text } from "@hyper-elements/react";

export const meta = {
  title: "Finch & Lowe listing sheet",
  description: "A flat’s listing sheet, with a floor plan drawn from room measurements and its current and potential energy ratings side by side.",
  root: "Document",
};

const PAPER = "#FBF9F2";
const INK = "#202A2A";
const SLATE = "#25494C";
const QUIET = "#4E6261";
const RULE = "#B8C6BF";
const FIELD = "#F0F2EB";
const GRID = "#DFE6DC";
const LIVING = "#FCFAF2";
const SLEEPING = "#FAF6E9";
const SERVICE = "#E5EDE7";
const HALL = "#EEF0E3";
const GLAZING = "#456F71";
const LIGHT_INK = "#D6E4D9";

const NEWSREADER = "Newsreader";
const HANKEN = "Hanken Grotesk";
const DM_MONO = "DM Mono";
const SERIF = `${NEWSREADER}, Georgia, serif`;
const SANS = `'${HANKEN}', Arial, sans-serif`;
const MONO = `'${DM_MONO}', Menlo, monospace`;
const FONTS = [
  { family: NEWSREADER, src: "https://fonts.gstatic.com/s/newsreader/v26/cY9AfjOCX1hbuyalUrK4397yjIJFJpc.woff2", format: "woff2", weight: 400 },
  { family: HANKEN, src: "https://fonts.gstatic.com/s/hankengrotesk/v12/ieVn2YZDLWuGJpnzaiwFXS9tYtpd59CxCis4.woff2", format: "woff2", weight: "400 700" },
  { family: DM_MONO, src: "https://fonts.gstatic.com/s/dmmono/v16/aFTU7PB1QTsUX8KYthqQBK6PYK0.woff2", format: "woff2", weight: 400 },
] as const;

export const ROOM_KINDS = ["living", "bedroom", "kitchen", "bathroom", "hall", "utility"] as const;
export const WALL_SIDES = ["north", "east", "south", "west"] as const;
export const HINGES = ["start", "end"] as const;
export const SWINGS = ["in", "out"] as const;
export const COUNCIL_BANDS = ["A", "B", "C", "D", "E", "F", "G", "H"] as const;
type PaperSize = "A4" | "Letter";
type WallSide = typeof WALL_SIDES[number];

export type Room = {
  name: string;
  kind: typeof ROOM_KINDS[number];
  x: number;
  y: number;
  width: number;
  depth: number;
};

export type WindowOpening = {
  room: string;
  wall: WallSide;
  offset: number;
  width: number;
};

export type DoorOpening = WindowOpening & {
  hinge: typeof HINGES[number];
  swing: typeof SWINGS[number];
};

export type Agency = {
  name: string;
  descriptor: string;
  website: string;
  email: string;
  phone: string;
  footerLine: string;
};

export type ListingValues = {
  agency?: Agency;
  reference: string;
  address: string;
  street: string;
  town: string;
  price: number;
  basis: "sale" | "rent";
  floor: string;
  tenure: string;
  councilTax: typeof COUNCIL_BANDS[number];
  bedrooms: number;
  bathrooms: number;
  description: [string, string];
  features: string[];
  rooms: Room[];
  doors: DoorOpening[];
  windows: WindowOpening[];
  epcCurrent: number;
  epcPotential: number;
  agent: string;
  /** Contact details from values files made before the agency fields. */
  phone?: string;
  email?: string;
  viewings: string;
};

export type ListingSheetProps = {
  values?: ListingValues;
  size?: PaperSize;
};

const finchAndLowe: Agency = {
  name: "Finch & Lowe",
  descriptor: "Estate & letting agents",
  website: "https://finchandlowe.example",
  email: "nell@finchandlowe.example",
  phone: "01632 960 214",
  footerLine: "Finch & Lowe",
};

export function listingAgency({ agency, phone, email }: ListingValues): Agency {
  return agency ?? { ...finchAndLowe, phone: phone ?? finchAndLowe.phone, email: email ?? finchAndLowe.email };
}

export function agencyWebsite(website: string): URL {
  let url: URL;
  try {
    url = new URL(website);
  } catch {
    throw new Error("agency.website: Enter a full website URL, including https:// or http://.");
  }
  if (!/^https?:\/\//i.test(website) || /[\s\\]/.test(website) || !url.hostname || url.username || url.password) {
    throw new Error("agency.website: Use an HTTP or HTTPS website URL without credentials.");
  }
  return url;
}

export const ropewalk: ListingValues = {
  agency: finchAndLowe,
  reference: "FL–042",
  address: "Flat 4, Ropewalk House",
  street: "12 Quay Lane",
  town: "Saltmere",
  price: 385000,
  basis: "sale",
  floor: "Second",
  tenure: "Leasehold",
  councilTax: "C",
  bedrooms: 2,
  bathrooms: 1,
  description: [
    "On the second floor of an old rope warehouse, this flat looks across Quay Lane towards the harbour. Deep window seats and the original timber beams tell you what the building used to be.",
    "The kitchen is separate from the living room. Both bedrooms sit off the hall, away from the quay.",
  ],
  features: ["Harbour outlook", "Original timber beams", "Separate kitchen", "Residents’ bike store"],
  rooms: [
    { name: "Living room", kind: "living", x: 0, y: 0, width: 5.2, depth: 4.1 },
    { name: "Kitchen", kind: "kitchen", x: 5.2, y: 0.4, width: 3.6, depth: 3.7 },
    { name: "Hall", kind: "hall", x: 0, y: 4.1, width: 8.8, depth: 1.35 },
    { name: "Bedroom 1", kind: "bedroom", x: 0, y: 5.45, width: 3.45, depth: 3.15 },
    { name: "Bedroom 2", kind: "bedroom", x: 3.45, y: 5.45, width: 3.15, depth: 2.9 },
    { name: "Bathroom", kind: "bathroom", x: 6.6, y: 5.45, width: 2.2, depth: 2.65 },
  ],
  doors: [
    { room: "Hall", wall: "east", offset: 0.2, width: 0.95, hinge: "start", swing: "in" },
    { room: "Living room", wall: "south", offset: 3.9, width: 0.88, hinge: "end", swing: "in" },
    { room: "Kitchen", wall: "south", offset: 0.32, width: 0.8, hinge: "start", swing: "in" },
    { room: "Bedroom 1", wall: "north", offset: 2.38, width: 0.8, hinge: "end", swing: "in" },
    { room: "Bedroom 2", wall: "north", offset: 0.24, width: 0.8, hinge: "start", swing: "in" },
    { room: "Bathroom", wall: "north", offset: 1.16, width: 0.76, hinge: "end", swing: "in" },
  ],
  windows: [
    { room: "Living room", wall: "north", offset: 0.55, width: 1.55 },
    { room: "Living room", wall: "north", offset: 3.1, width: 1.55 },
    { room: "Kitchen", wall: "north", offset: 1.05, width: 1.5 },
    { room: "Bedroom 1", wall: "south", offset: 0.83, width: 1.75 },
    { room: "Bedroom 2", wall: "south", offset: 0.75, width: 1.65 },
    { room: "Bathroom", wall: "south", offset: 0.68, width: 0.84 },
  ],
  epcCurrent: 72,
  epcPotential: 84,
  agent: "Nell Finch",
  viewings: "By appointment on Thursdays, 4–6 pm, and Saturdays, 10 am–noon.",
};

const ROOM_FILL = { living: LIVING, bedroom: SLEEPING, kitchen: SERVICE, bathroom: SERVICE, hall: HALL, utility: SERVICE };
const EPSILON = 0.000001;
const nearly = (a: number, b: number) => Math.abs(a - b) < EPSILON;
const border = (color = RULE) => `1px solid ${color}`;
const label = { fontFamily: MONO, fontSize: 10, lineHeight: 1.35, letterSpacing: 1.15, textTransform: "uppercase", color: SLATE } as const;
const heading = { fontFamily: SERIF, fontWeight: 400, lineHeight: 1.04, color: INK } as const;

const feet = (metres: number) => {
  const inches = Math.round(metres / 0.0254);
  return `${Math.floor(inches / 12)}'${inches % 12}"`;
};
const metric = (room: Room) => `${room.width.toFixed(2)} × ${room.depth.toFixed(2)} m`;
const imperial = (room: Room) => `${feet(room.width)} × ${feet(room.depth)}`;

type Edge = { horizontal: boolean; at: number; start: number; end: number };
type MeasuredOpening = Edge & { field: string; name: string; wall: WallSide; door?: DoorOpening };
type Wall = Edge & { outside: boolean };
const OPPOSITE_WALL = { north: "south", east: "west", south: "north", west: "east" } as const;

function roomEdge(room: Room, wall: WallSide): Edge {
  const horizontal = wall === "north" || wall === "south";
  const start = horizontal ? room.x : room.y;
  const at = { north: room.y, east: room.x + room.width, south: room.y + room.depth, west: room.x }[wall];
  return { horizontal, at, start, end: start + (horizontal ? room.width : room.depth) };
}

const sameWall = (a: Edge, b: Edge) => a.horizontal === b.horizontal && nearly(a.at, b.at);
const spanOverlaps = (a: Edge, b: Edge) => Math.min(a.end, b.end) - Math.max(a.start, b.start) > EPSILON;
const swingDirection = ({ wall, swing }: DoorOpening) =>
  (wall === "north" || wall === "west" ? 1 : -1) * (swing === "in" ? 1 : -1);

function measurePlan(rooms: Room[], doors: DoorOpening[], windows: WindowOpening[]) {
  const byName = new Map<string, Room>();
  const neighbors = rooms.map(() => new Set<number>());
  if (!rooms.length) throw new Error("rooms: Add at least one room.");
  for (const [i, a] of rooms.entries()) {
    if (byName.has(a.name)) throw new Error(`rooms[${i}].name: "${a.name}" is already used by another room.`);
    byName.set(a.name, a);
    if (a.x + a.width > 16 + EPSILON || a.y + a.depth > 16 + EPSILON) {
      throw new Error(`rooms[${i}]: "${a.name}" extends beyond the plan's 16 m by 16 m field.`);
    }
    for (let j = i + 1; j < rooms.length; j++) {
      const b = rooms[j];
      const overlapX = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
      const overlapY = Math.min(a.y + a.depth, b.y + b.depth) - Math.max(a.y, b.y);
      if (overlapX > EPSILON && overlapY > EPSILON) {
        throw new Error(`rooms[${j}]: "${b.name}" overlaps "${a.name}".`);
      }
      const sharedWall = WALL_SIDES.some((side) => {
        const edge = roomEdge(a, side);
        const opposite = roomEdge(b, OPPOSITE_WALL[side]);
        return sameWall(edge, opposite) && spanOverlaps(edge, opposite);
      });
      if (sharedWall) {
        neighbors[i].add(j);
        neighbors[j].add(i);
      }
    }
  }
  const isolated = neighbors.findIndex((adjacent) => adjacent.size === 0);
  if (rooms.length > 1 && isolated >= 0) {
    throw new Error(`rooms[${isolated}]: "${rooms[isolated].name}" must share a wall with another room.`);
  }
  const connected = new Set([0]);
  for (const i of connected) {
    for (const j of neighbors[i]) connected.add(j);
  }
  const disconnected = rooms.findIndex((_, i) => !connected.has(i));
  if (disconnected >= 0) {
    throw new Error(`rooms[${disconnected}]: "${rooms[disconnected].name}" is in a separate group. All rooms must form one connected footprint.`);
  }

  const measureOpening = (item: WindowOpening, field: string, door?: DoorOpening): MeasuredOpening => {
    const room = byName.get(item.room);
    if (!room) throw new Error(`${field}.room: "${item.room}" is missing from rooms.`);
    const edge = roomEdge(room, item.wall);
    const start = edge.start + item.offset;
    const end = start + item.width;
    if (start < edge.start + 0.05 - EPSILON) {
      throw new Error(`${field}.offset: Leave at least 0.05 m before the opening on ${item.room}'s ${item.wall} wall.`);
    }
    if (end > edge.end - 0.05 + EPSILON) {
      throw new Error(`${field}.width: The opening at this offset must leave at least 0.05 m at the end of ${item.room}'s ${item.wall} wall.`);
    }
    const opening = { ...edge, start, end, field, name: item.room, wall: item.wall, door };
    const shared = rooms.filter((other) => other !== room)
      .map((other) => roomEdge(other, OPPOSITE_WALL[item.wall]))
      .filter((opposite) => sameWall(opening, opposite) && spanOverlaps(opening, opposite));
    if (!door && shared.length > 0) {
      throw new Error(`${field}.wall: The window on ${item.room}'s ${item.wall} wall must lie entirely on an outside wall.`);
    }
    if (door && shared.length > 0 && !shared.some((opposite) => start >= opposite.start - EPSILON && end <= opposite.end + EPSILON)) {
      throw new Error(`${field}.wall: The door on ${item.room}'s ${item.wall} wall must lie entirely on an outside wall or a wall shared with one other room.`);
    }
    return opening;
  };
  const openings = [
    ...doors.map((door, i) => measureOpening(door, `doors[${i}]`, door)),
    ...windows.map((window, i) => measureOpening(window, `windows[${i}]`)),
  ];

  for (const [i, a] of openings.entries()) {
    const overlap = openings.slice(i + 1).find((b) => sameWall(a, b) && spanOverlaps(a, b));
    if (overlap) {
      throw new Error(`${overlap.field}.offset: This opening overlaps ${a.field} on ${a.name}'s ${a.wall} wall.`);
    }
  }

  const edges = rooms.flatMap((room) => WALL_SIDES.map((side) => roomEdge(room, side)));
  const groups: Edge[][] = [];
  for (const edge of edges) {
    const group = groups.find(([first]) => sameWall(first, edge));
    if (group) group.push(edge);
    else groups.push([edge]);
  }

  const walls: Wall[] = [];
  for (const group of groups) {
    const [edge] = group;
    const gaps = openings.filter((opening) => sameWall(opening, edge));
    const cuts = [...group, ...gaps].flatMap(({ start, end }) => [start, end]).sort((a, b) => a - b);
    for (let i = 1; i < cuts.length; i++) {
      const start = cuts[i - 1];
      const end = cuts[i];
      if (nearly(start, end)) continue;
      const mid = (start + end) / 2;
      const faces = group.filter((face) => face.start < mid && mid < face.end).length;
      if (!faces) continue;
      if (gaps.some((opening) => opening.start < mid && mid < opening.end)) continue;
      walls.push({ ...edge, start, end, outside: faces === 1 });
    }
  }

  return {
    walls,
    openings,
    area: rooms.reduce((sum, room) => sum + room.width * room.depth, 0),
    left: Math.min(...rooms.map(({ x }) => x)),
    right: Math.max(...rooms.map(({ x, width }) => x + width)),
    top: Math.min(...rooms.map(({ y }) => y)),
    bottom: Math.max(...rooms.map(({ y, depth }) => y + depth)),
  };
}

function FinchMark() {
  return (
    <Svg width={44} height={44} viewBox="0 0 44 44" title="Finch & Lowe’s finch mark">
      <Rect width={44} height={44} style={{ fill: SLATE }} />
      <Path d="M7 30L15 22C18 15 23 13 28 16C30 12 34 12 36 15L40 17L35 19C33 27 28 30 21 30H7Z" style={{ fill: PAPER }} />
      <Path d="M15 26C21 26 25 23 28 19L22 20Z" style={{ fill: SLATE }} />
      <Circle cx={33} cy={16} r={1} style={{ fill: SLATE }} />
      <Line x1={20} y1={34} x2={32} y2={34} style={{ stroke: LIGHT_INK, strokeWidth: 0.8 }} />
    </Svg>
  );
}

function AgencyMark({ name }: { name: string }) {
  if (name === finchAndLowe.name) return <FinchMark />;
  const words = name.match(/[\p{L}\p{N}]+/gu) ?? [];
  const initials = words.filter((_, i) => i === 0 || i === words.length - 1)
    .map((word) => Array.from(word)[0].toUpperCase()).join("");
  return (
    <Column style={{ width: 44, height: 44, backgroundColor: SLATE, justifyContent: "center" }}>
      <Text style={{ ...heading, fontSize: 21, color: PAPER, textAlign: "center" }}>{initials}</Text>
    </Column>
  );
}

function drawFloorPlan({ rooms, plan, width, height, isLetter }: {
  rooms: Room[];
  plan: ReturnType<typeof measurePlan>;
  width: number;
  height: number;
  isLetter: boolean;
}) {
  const { left, right, top, bottom, walls, openings, area } = plan;
  const rail = 169;
  const board = width - rail;
  // Include open door leaves when fitting a stepped footprint into the drawing board.
  const tips = openings.flatMap(({ door, at, horizontal, start, end }) =>
    door ? [{ horizontal, at: at + swingDirection(door) * (end - start) }] : []);
  const xTips = tips.filter(({ horizontal }) => !horizontal).map(({ at }) => at);
  const yTips = tips.filter(({ horizontal }) => horizontal).map(({ at }) => at);
  const xMin = Math.min(left, ...xTips);
  const yMin = Math.min(top, ...yTips);
  const extentX = Math.max(right, ...xTips) - xMin;
  const extentY = Math.max(bottom, ...yTips) - yMin;
  const scale = Math.min((board - 82) / extentX, (height - (isLetter ? 35 : 57)) / extentY);
  const x = (value: number) => (board + 16 - extentX * scale) / 2 + (value - xMin) * scale;
  const y = (value: number) => (height - (isLetter ? 0 : 12) - extentY * scale) / 2 + (value - yMin) * scale;
  const point = (horizontal: boolean, along: number, across: number) =>
    horizontal ? [x(along), y(across)] : [x(across), y(along)];
  const swept = openings.flatMap(({ door, horizontal, at, start, end }) => {
    if (!door) return [];
    const [ax, ay] = point(horizontal, start, at);
    const [bx, by] = point(horizontal, end, at + swingDirection(door) * (end - start));
    return [{ left: Math.min(ax, bx), right: Math.max(ax, bx), top: Math.min(ay, by), bottom: Math.max(ay, by) }];
  });
  const wallLine = ({ horizontal, at, start, end }: Edge, color: string, weight: number, key: string) => {
    const [x1, y1] = point(horizontal, start, at);
    const [x2, y2] = point(horizontal, end, at);
    return <Line key={key} x1={x1} y1={y1} x2={x2} y2={y2} style={{ stroke: color, strokeWidth: weight }} />;
  };
  const wallBlock = ({ horizontal, at, start, end, outside }: Wall, i: number) => {
    const [x1, y1] = point(horizontal, start, at);
    const length = (end - start) * scale;
    const weight = outside ? 5.8 : 3.1;
    return <Rect key={i} x={x1 - weight / 2} y={y1 - weight / 2}
      width={horizontal ? length + weight : weight} height={horizontal ? weight : length + weight}
      style={{ fill: INK }} />;
  };

  const labels = rooms.map((room, i) => {
    const wide = room.width * scale;
    const tall = room.depth * scale;
    const nameSize = Math.min(13, (wide - 12) / (room.name.length * 0.59));
    const isHall = room.kind === "hall" && wide > 186 && tall < 62;
    const shortLine = Math.max(metric(room).length, imperial(room).length);
    const dimensions = `${metric(room)} / ${imperial(room)}`;
    const dimLength = isHall ? dimensions.length : shortLine;
    const dimSize = Math.min(10, (wide - 8) / (dimLength * 0.60));
    const labelWidth = Math.min(wide - 8, Math.max(room.name.length * nameSize * 0.59, dimLength * dimSize * 0.60) + 4);
    const labelHeight = isHall ? 27 : 40;
    const startX = x(room.x);
    const startY = y(room.y);
    // Try a few small nudges before moving the label to the key.
    const position = nameSize >= 9.5 && dimSize >= 8.2 && (isHall || tall >= 58)
      ? [[0, 0], [0, 7], [0, -7], [7, 0], [-7, 0], [0, 13], [0, -13], [13, 0], [-13, 0]]
        .map(([dx, dy]) => ({ left: startX + (wide - labelWidth) / 2 + dx, top: startY + (tall - labelHeight) / 2 + dy }))
        .find(({ left, top }) => left >= startX + 4 - EPSILON && left + labelWidth <= startX + wide - 4 + EPSILON &&
          top >= startY + 3 && top + labelHeight <= startY + tall - 3 &&
          !swept.some((door) => left < door.right + 1 && left + labelWidth > door.left - 1 &&
            top < door.bottom + 1 && top + labelHeight > door.top - 1))
      : undefined;
    return {
      room, i, nameSize, dimSize, isHall, dimensions, labelWidth, position,
    };
  });
  const roomKey = labels.filter(({ position }) => !position);
  const scaleMetres = [5, 2, 1, 0.5, 0.2, 0.1].find((metres) => metres * scale < rail - 43) ?? 0.1;
  const scaleWidth = scaleMetres * scale;
  const compassX = 28;
  const legendX = board + 24;
  const keyY = 128;
  const keyEnd = keyY + roomKey.reduce((end, { room }) => end + (room.name.length > 18 ? 54 : 42), 0);
  const showLegend = keyEnd <= height - 125;
  const legendY = height - 118;
  const scaleY = height - 42;
  const overlay = (key: string, left: number, top: number, width: number, text: ReturnType<typeof FinchMark>) => (
    <Column key={key} style={{ padding: [top, 0, 0, left] }}>
      <Column style={{ width }}>{text}</Column>
    </Column>
  );

  const element = (
    <Layer style={{ width, height, backgroundColor: FIELD }}>
      <Svg width={width} height={height} title="Measured floor plan with doors, windows, north arrow and scale">
        <Rect width={width} height={height} style={{ fill: FIELD }} />
        {Array.from({ length: Math.floor((board - 16) / 20) }, (_, i) => (
          <Line key={`x${i}`} x1={16 + i * 20} x2={16 + i * 20} y1={13} y2={height - 13} style={{ stroke: GRID, strokeWidth: 0.5 }} />
        ))}
        {Array.from({ length: Math.floor((height - 14) / 20) }, (_, i) => (
          <Line key={`y${i}`} x1={15} x2={board - 14} y1={16 + i * 20} y2={16 + i * 20} style={{ stroke: GRID, strokeWidth: 0.5 }} />
        ))}
        <Line x1={board} x2={board} y1={16} y2={height - 16} style={{ stroke: RULE, strokeWidth: 1 }} />
        {rooms.map((room) => (
          <Rect key={room.name} x={x(room.x)} y={y(room.y)} width={room.width * scale} height={room.depth * scale} style={{ fill: ROOM_FILL[room.kind] }} />
        ))}
        {walls.map(wallBlock)}
        {openings.flatMap((opening, i) => {
          const { horizontal, at, start, end, door } = opening;
          if (!door) {
            return [-1.75, 1.75].map((shift) => wallLine({ ...opening, at: at + shift / scale }, GLAZING, 1.2, `${i}:${shift}`));
          }
          const hinge = door.hinge === "start" ? start : end;
          const latch = door.hinge === "start" ? end : start;
          const direction = swingDirection(door);
          const radius = end - start;
          const [hx, hy] = point(horizontal, hinge, at);
          const [lx, ly] = point(horizontal, latch, at);
          const [ox, oy] = point(horizontal, hinge, at + direction * radius);
          const clockwise = (lx - hx) * (oy - hy) - (ly - hy) * (ox - hx) > 0 ? 1 : 0;
          return [
            <Path key={`arc:${i}`} d={`M${lx} ${ly} A${radius * scale} ${radius * scale} 0 0 ${clockwise} ${ox} ${oy}`} style={{ fill: "transparent", stroke: GLAZING, strokeWidth: 0.85 }} />,
            <Line key={`leaf:${i}`} x1={hx} y1={hy} x2={ox} y2={oy} style={{ stroke: GLAZING, strokeWidth: 1.4 }} />,
          ];
        })}
        <Path d={`M${compassX} 33l-6.5 20 6.5-5 6.5 5z`} style={{ fill: SLATE }} />
        <Line x1={compassX} x2={compassX} y1={48} y2={63} style={{ stroke: SLATE, strokeWidth: 1.15 }} />
        {showLegend && (
          <>
            <Path d={`M${legendX} ${legendY + 11}h13a13 13 0 0 0-13-13z`} style={{ fill: "transparent", stroke: GLAZING, strokeWidth: 0.9 }} />
            <Line x1={legendX} x2={legendX + 13} y1={legendY + 24} y2={legendY + 24} style={{ stroke: GLAZING, strokeWidth: 1 }} />
            <Line x1={legendX} x2={legendX + 13} y1={legendY + 27} y2={legendY + 27} style={{ stroke: GLAZING, strokeWidth: 1 }} />
          </>
        )}
        <Rect x={legendX} y={scaleY} width={scaleWidth / 2} height={4} style={{ fill: SLATE }} />
        <Rect x={legendX + scaleWidth / 2} y={scaleY} width={scaleWidth / 2} height={4} style={{ fill: PAPER, stroke: SLATE, strokeWidth: 0.7 }} />
        {[0, scaleWidth / 2, scaleWidth].map((distance) => (
          <Line key={distance} x1={legendX + distance} x2={legendX + distance} y1={scaleY - 3} y2={scaleY + 5} style={{ stroke: SLATE, strokeWidth: 0.75 }} />
        ))}
      </Svg>
      {overlay("north", compassX - 8, 17, 16, <Text style={{ ...label, textAlign: "center", letterSpacing: 0 }}>N</Text>)}
      {labels.map(({ room, i, position, isHall, nameSize, dimSize, dimensions, labelWidth }) => {
        const wide = room.width * scale;
        const tall = room.depth * scale;
        const dimStyle = { fontFamily: MONO, fontSize: dimSize, lineHeight: 1.25, color: QUIET, textAlign: "center" } as const;
        if (!position) {
          const size = Math.min(15, wide - 4, tall - 4);
          return overlay(room.name, x(room.x) + (wide - size) / 2, y(room.y) + (tall - size) / 2, size,
            <Text style={{ ...label, fontSize: size * 0.72, lineHeight: 1.35, letterSpacing: 0, textAlign: "center", backgroundColor: SLATE, color: PAPER }}>{i + 1}</Text>);
        }
        return overlay(room.name, position.left, position.top, labelWidth,
          <Column style={{ gap: 1 }}>
            <Text style={{ fontSize: nameSize, fontWeight: 700, lineHeight: 1.15, textAlign: "center" }}>
              {room.name}
            </Text>
            {isHall ? <Text style={dimStyle}>{dimensions}</Text> : (
              <>
                <Text style={dimStyle}>{metric(room)}</Text>
                <Text style={dimStyle}>{imperial(room)}</Text>
              </>
            )}
          </Column>);
      })}
      {overlay("area", legendX, 23, rail - 33,
        <Column style={{ gap: 4 }}>
          <Text style={{ ...label, fontSize: 9.5, letterSpacing: 0.25 }}>Approximate floor area</Text>
          <Text style={{ ...heading, fontSize: 34, color: SLATE }}>{area.toFixed(1)} <Span style={{ fontSize: 20 }}>m²</Span></Text>
          <Text style={{ fontFamily: MONO, fontSize: 12, color: QUIET }}>{Math.round(area / (0.3048 ** 2)).toLocaleString("en-GB")} ft²</Text>
          <Text style={{ fontSize: 11, color: QUIET }}>Sum of room areas</Text>
        </Column>)}
      {roomKey.length > 0 && overlay("room key", legendX, keyY, rail - 31,
        <Column style={{ gap: 4 }}>
          {roomKey.map(({ room, i }) => (
            <Column key={room.name} style={{ gap: 0 }}>
              <Text style={{ fontSize: 11, fontWeight: 700, lineHeight: 1.1 }}>{i + 1}. {room.name}</Text>
              <Text style={{ fontFamily: MONO, fontSize: 11, lineHeight: 1.15, color: QUIET }}>
                {metric(room)}<LineBreak />{imperial(room)}
              </Text>
            </Column>
          ))}
        </Column>)}
      {showLegend && overlay("door legend", legendX + 24, legendY, 95, <Text style={{ fontSize: 11, color: QUIET }}>Door swing</Text>)}
      {showLegend && overlay("window legend", legendX + 24, legendY + 19, 95, <Text style={{ fontSize: 11, color: QUIET }}>Window</Text>)}
      {overlay("scale label", legendX, scaleY - 20, 125, <Text style={{ ...label, fontSize: 9 }}>Scale in metres</Text>)}
      {overlay("scale start", legendX - 3, scaleY + 10, 12, <Text style={{ fontFamily: MONO, fontSize: 9, color: QUIET }}>0</Text>)}
      {overlay("scale end", legendX + scaleWidth - 7, scaleY + 10, 30, <Text style={{ fontFamily: MONO, fontSize: 9, color: QUIET }}>{scaleMetres}</Text>)}
    </Layer>
  );
  return { element, keyFits: keyEnd <= scaleY - 23 };
}

const EPC = [
  { grade: "A", min: 92, max: 100, color: "#137448", ink: PAPER },
  { grade: "B", min: 81, max: 91, color: "#33834C", ink: PAPER },
  { grade: "C", min: 69, max: 80, color: "#A0BE70", ink: INK },
  { grade: "D", min: 55, max: 68, color: "#E7D667", ink: INK },
  { grade: "E", min: 39, max: 54, color: "#F0BD62", ink: INK },
  { grade: "F", min: 21, max: 38, color: "#E6935B", ink: INK },
  { grade: "G", min: 1, max: 20, color: "#B64B43", ink: PAPER },
];
const gradeOf = (score: number) => EPC.find(({ min }) => score >= min) ?? EPC[EPC.length - 1];

function EnergyChart({ current, potential, width }: { current: number; potential: number; width: number }) {
  const height = 137;
  const step = 17;
  const barHeight = 15;
  const arrowWidth = 58;
  const barEnd = (i: number) => width - 132 - i * 15;
  const marks = [
    { score: current, name: "Current", x: width - 121, fill: SLATE, ink: PAPER },
    { score: potential, name: "Potential", x: width - arrowWidth, fill: LIGHT_INK, ink: INK },
  ];
  return (
    <Layer style={{ width, height }}>
      <Svg width={width} height={height} title={`Energy performance: current ${current} ${gradeOf(current).grade}, potential ${potential} ${gradeOf(potential).grade}`}>
        {EPC.map(({ grade, color }, i) => {
          const y = 18 + i * step;
          const end = barEnd(i);
          return <Polygon key={grade} points={`0,${y} ${end - 7},${y} ${end},${y + barHeight / 2} ${end - 7},${y + barHeight} 0,${y + barHeight}`} style={{ fill: color }} />;
        })}
        {marks.map(({ score, name, x, fill }) => {
          const { grade } = gradeOf(score);
          const y = 18 + EPC.findIndex((band) => band.grade === grade) * step;
          return <Polygon key={name} points={`${x},${y + barHeight / 2} ${x + 7},${y} ${x + arrowWidth},${y} ${x + arrowWidth},${y + barHeight} ${x + 7},${y + barHeight}`} style={{ fill }} />;
        })}
      </Svg>
      {EPC.map(({ grade, min, max, ink }, i) => (
        <Column key={grade} style={{ padding: [19 + i * step, 0, 0, 7] }}>
          <Text style={{ fontFamily: MONO, fontSize: 11, lineHeight: "13px", color: ink }}>{grade}   {min}–{max}</Text>
        </Column>
      ))}
      {marks.map(({ score, name, x, ink }) => {
        const { grade } = gradeOf(score);
        return (
          <Column key={name} style={{ padding: [0, 0, 0, x] }}>
            <Column style={{ width: arrowWidth, gap: 6 + EPC.findIndex((band) => band.grade === grade) * step }}>
              <Text style={{ ...label, fontSize: 10.7, letterSpacing: 0, lineHeight: "13px", textAlign: "center" }}>{name}</Text>
              <Text style={{ fontFamily: MONO, fontSize: 11, lineHeight: "13px", color: ink, textAlign: "center" }}>{score} {grade}</Text>
            </Column>
          </Column>
        );
      })}
    </Layer>
  );
}

export default function FinchLoweListingSheet({ values = ropewalk, size = "A4" }: ListingSheetProps = {}) {
  const v = values;
  const agency = listingAgency(v);
  const website = agencyWebsite(agency.website);
  const dial = agency.phone.replace(/\D/g, "");
  const telephone = agency.phone.startsWith("+") ? `+${dial}` : `+44${dial.slice(1)}`;
  if (![v.price, v.bedrooms, v.bathrooms, v.epcCurrent, v.epcPotential].every(Number.isInteger)) {
    throw new Error("Use whole numbers for price, room counts and EPC scores.");
  }
  if (v.bedrooms !== v.rooms.filter(({ kind }) => kind === "bedroom").length ||
      v.bathrooms !== v.rooms.filter(({ kind }) => kind === "bathroom").length) {
    throw new Error("The bedroom and bathroom counts must match the rooms on the plan.");
  }
  if (v.epcPotential < v.epcCurrent) throw new Error("The potential EPC score must be at least the current score.");
  const plan = measurePlan(v.rooms, v.doors, v.windows);
  const isLetter = size === "Letter";
  const width = isLetter ? 712 : 690;
  const area = `${plan.area.toFixed(1)} m² / ${Math.round(plan.area / (0.3048 ** 2)).toLocaleString("en-GB")} ft²`;
  const price = `£${v.price.toLocaleString("en-GB")}${v.basis === "rent" ? " pcm" : ""}`;
  const facts = [
    { name: "Bedrooms", value: v.bedrooms || "Studio" },
    { name: "Bathrooms", value: v.bathrooms },
    { name: "Approx. floor area", value: area, width: 136 },
    { name: "Floor", value: v.floor },
    { name: "Tenure", value: v.tenure, width: 139 },
    { name: "Council tax", value: `Band ${v.councilTax}` },
  ];
  const energyWidth = Math.round((width - 29) * 0.49);
  // Give longer particulars or a room-heavy plan a second sheet at either paper size.
  const longListing = v.address.length > 32 || v.street.length + v.town.length > 52 ||
    v.description.some((paragraph) => paragraph.length > 190) ||
    v.features.length > 5 || v.features.filter((feature) => feature.length > 28).length > 2 ||
    v.rooms.length > 7 || v.viewings.length > 88 || agency.footerLine.length + website.hostname.length > 83;
  const shortPlan = longListing ? undefined : drawFloorPlan({ rooms: v.rooms, plan, width, height: isLetter ? 312 : 351, isLetter });
  const separatePlan = !shortPlan || !shortPlan.keyFits;
  const drawing = separatePlan
    ? drawFloorPlan({ rooms: v.rooms, plan, width, height: isLetter ? 640 : 690, isLetter })
    : shortPlan;
  const addressBreak = v.address.length > 32 ? v.address.lastIndexOf(" ", 26) : -1;
  const addressLines = addressBreak > 0
    ? [v.address.slice(0, addressBreak), v.address.slice(addressBreak + 1)]
    : [v.address];
  const longestAddressLine = Math.max(...addressLines.map((line) => line.length));
  const addressSize = Math.min(longestAddressLine > 26 ? 43 : 53, (width - 185) / (longestAddressLine * 0.43));
  const priceSize = Math.min(price.length > 9 ? 31 : 38, 150 / (price.length * 0.46));
  const floorPlan = (
    <Column style={{ gap: 9 }}>
      <Row style={{ alignItems: "end", gap: 12, padding: [8, 0, 0], border: { top: border(SLATE) } }}>
        <Heading level={2} style={{ ...heading, fontSize: 30 }}>Floor plan</Heading>
        <Text style={{ ...label, width: 185, textAlign: "right", fontSize: 9.5 }}>{v.floor} floor</Text>
      </Row>
      {drawing.element}
    </Column>
  );

  return (
    <Document size={size} margin={[isLetter ? 36 : 40, 52, isLetter ? 31 : 38, 52]} lang="en-GB"
      title={`${v.address}, ${v.town} | ${agency.name}`} fonts={[...FONTS]}
      style={{ fontFamily: SANS, fontSize: 14, lineHeight: 1.42, color: INK, backgroundColor: PAPER }}>
      <Document.Page style={{ gap: separatePlan ? 32 : isLetter ? 13 : 16 }}>
        <Row style={{ alignItems: "center", gap: 12, padding: [0, 0, 13], border: { bottom: border(SLATE) } }}>
          <AgencyMark name={agency.name} />
          <Column style={{ gap: 3 }}>
            <Text style={{ ...heading, fontSize: 27, color: SLATE }}>{agency.name}</Text>
            <Text style={{ ...label, fontSize: 9.5 }}>{agency.descriptor}</Text>
          </Column>
          <Column style={{ width: 150, gap: 3 }}>
            <Text style={{ ...label, textAlign: "right" }}>Particulars</Text>
            <Text style={{ fontFamily: MONO, fontSize: 11, color: QUIET, textAlign: "right" }}>Ref. {v.reference}</Text>
          </Column>
        </Row>

        <Row style={{ alignItems: "end", gap: 18 }}>
          <Column style={{ gap: 4 }}>
            <Heading level={1} style={{ ...heading, fontSize: addressSize, letterSpacing: -1.6 }}>
              {addressLines[0]}{addressLines.length > 1 && <><LineBreak />{addressLines[1]}</>}
            </Heading>
            <Text style={{ fontSize: 17, color: QUIET }}>{v.street}, {v.town}</Text>
          </Column>
          <Column style={{ width: 164, gap: 5, padding: [0, 0, 2] }}>
            <Text style={{ ...label, textAlign: "right" }}>{v.basis === "sale" ? "For sale" : "To let"}</Text>
            <Text style={{ ...heading, textAlign: "right", color: SLATE, fontSize: priceSize }}>{price}</Text>
          </Column>
        </Row>

        <Row style={{ gap: 10, padding: [12, 0, 10], border: { top: border(RULE), bottom: border(RULE) } }}>
          {facts.map(({ name, value, width }) => (
            <Column key={name} style={{ width, gap: 4 }}>
              <Text style={{ ...label, fontSize: 9, letterSpacing: 0.55 }}>{name}</Text>
              <Text style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.15 }}>{value}</Text>
            </Column>
          ))}
        </Row>

        <Row style={{ gap: 28 }}>
          <Column style={{ gap: separatePlan ? 12 : 7 }}>
            <Heading level={2} style={{ ...heading, fontSize: separatePlan ? 29 : 24 }}>About the home</Heading>
            {v.description.map((paragraph, i) => <Text key={i} style={{ fontSize: separatePlan ? 16 : 14, lineHeight: 1.38 }}>{paragraph}</Text>)}
          </Column>
          <Column style={{ width: separatePlan ? 259 : 231, gap: separatePlan ? 11 : 7, padding: [0, 0, 0, 19], border: { left: border() } }}>
            <Heading level={2} style={{ ...heading, fontSize: separatePlan ? 29 : 24 }}>Key features</Heading>
            <Column style={{ gap: separatePlan ? 6 : 3 }}>
              {v.features.map((feature, i) => (
                <Row key={i} style={{ gap: 6 }}>
                  <Column style={{ width: 7, padding: [6, 0, 0] }}>
                    <Svg width={4} height={4}><Rect width={3} height={3} style={{ fill: SLATE }} /></Svg>
                  </Column>
                  <Text style={{ fontSize: separatePlan ? 14 : 13, lineHeight: 1.28 }}>{feature}</Text>
                </Row>
              ))}
            </Column>
          </Column>
        </Row>

        {!separatePlan && floorPlan}

        <Row style={{ gap: 29, alignItems: "stretch" }}>
          <Column style={{ width: energyWidth, gap: 7 }}>
            <Heading level={2} style={{ ...heading, fontSize: 25 }}>Energy performance</Heading>
            <EnergyChart current={v.epcCurrent} potential={v.epcPotential} width={energyWidth} />
          </Column>
          <Column style={{ backgroundColor: SLATE, padding: [15, 19], gap: 6, color: PAPER, justifyContent: "center" }}>
            <Heading level={2} style={{ ...heading, fontSize: 26, color: PAPER }}>Arrange a viewing</Heading>
            <Text style={{ color: LIGHT_INK, fontSize: 12.5, lineHeight: 1.35 }}>{v.viewings}</Text>
            <Text style={{ color: PAPER, fontSize: 15, lineHeight: 1.35, fontWeight: 700 }}>{v.agent}</Text>
            <Text style={{ color: PAPER, fontSize: 12, lineHeight: 1.25 }}>
              <Link href={`tel:${telephone}`} style={{ color: PAPER }}>{agency.phone}</Link>
            </Text>
            <Text style={{ color: PAPER, fontSize: 12, lineHeight: 1.25 }}>
              <Link href={`mailto:${agency.email}`} style={{ color: PAPER }}>{agency.email}</Link>
            </Text>
          </Column>
        </Row>
      </Document.Page>

      {separatePlan && (
        <Document.Page style={{ gap: 23 }}>
          <Row style={{ alignItems: "center", gap: 12 }}>
            <AgencyMark name={agency.name} />
            <Column style={{ gap: 2 }}>
              <Text style={{ ...heading, fontSize: 27, color: SLATE }}>{v.address}</Text>
              <Text style={{ fontSize: 13, color: QUIET }}>{v.street}, {v.town}</Text>
            </Column>
            <Text style={{ ...label, width: 140, textAlign: "right" }}>Ref. {v.reference}</Text>
          </Row>
          {floorPlan}
        </Document.Page>
      )}

      <PageFooter style={{ padding: [10, 0, 0], gap: 5, border: { top: border() } }}>
        <Text style={{ fontSize: 10.5, color: QUIET }}>Room measurements are approximate. Floor area is the sum of the rooms. These particulars do not form part of a contract.</Text>
        <Row style={{ gap: 12 }}>
          <Text style={{ ...label, fontSize: 9, letterSpacing: 0.5 }}>
            {agency.footerLine} · <Link href={website.href} style={{ color: SLATE }}>{website.hostname}</Link>
          </Text>
          <Text style={{ ...label, fontSize: 9, letterSpacing: 0.5, width: 140, textAlign: "right" }}>{v.reference} · <PageNumber /> / <PageNumber total /></Text>
        </Row>
      </PageFooter>
    </Document>
  );
}
