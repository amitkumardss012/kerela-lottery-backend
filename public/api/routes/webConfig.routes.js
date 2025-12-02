"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const webConfig_controller_1 = require("../controllers/webConfig.controller");
const router = (0, express_1.Router)();
router.put("/update", webConfig_controller_1.updateWebConfig);
router.get("/", webConfig_controller_1.getWebConfig);
exports.default = router;
