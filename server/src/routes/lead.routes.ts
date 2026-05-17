import express from "express"
import { addLead, editLead, deleteLead, getLeadDetail, getLeadList, exportLeadsCSV } from "../controllers/lead.controller";
import { verifyJWT } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/role.middleware";

const router = express.Router()

router.post(
    '/postLead', 
    verifyJWT, 
    authorizeRoles("Admin", "Sales User"), 
    addLead
);

router.put(
    '/editLead', 
    verifyJWT, 
    authorizeRoles("Admin", "Sales User"), 
    editLead
);

router.delete(
    '/deleteLead/:leadId', 
    verifyJWT, 
    authorizeRoles("Admin"), 
    deleteLead
);

router.get(
    '/leadDetail/:leadId',
    verifyJWT,
    authorizeRoles("Admin", "Sales User"),
    getLeadDetail
);

router.get(
    '/leadList',
    verifyJWT,
    authorizeRoles("Admin", "Sales User"),
    getLeadList
);

router.get(
    '/exportLeads',
    verifyJWT,
    authorizeRoles("Admin", "Sales User"),
    exportLeadsCSV
);

export default router;