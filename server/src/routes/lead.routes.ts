import express from "express"
import { addLead, editLead, deleteLead, getLeadDetail, getLeadList, exportLeadsCSV } from "../controllers/lead.controller";
import { verifyJWT } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/role.middleware";

const router = express.Router()

router.post(
    '/postLead', 
    verifyJWT, 
    authorizeRoles("Admin", "Employee"), 
    addLead
);

router.put(
    '/editLead', 
    verifyJWT, 
    authorizeRoles("Admin", "Employee"), 
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
    authorizeRoles("Admin", "Employee"),
    getLeadDetail
);

router.get(
    '/leadList',
    verifyJWT,
    authorizeRoles("Admin", "Employee"),
    getLeadList
);

router.get(
    '/exportLeads',
    verifyJWT,
    authorizeRoles("Admin", "Sales User"),
    exportLeadsCSV
);

export default router;