import { serveFixed } from "../adapter.mjs";
export default (req, res) => serveFixed(req, res, "/boundary");
