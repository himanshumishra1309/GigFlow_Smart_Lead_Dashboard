import api from "./api";

export const leadService = {
    postLead : async (leadData: any) => {
        const response = await api.post('/leads/postLead', leadData);
        return response.data;
    },

    editLead : async (leadData: any) => {
        const response = await api.put('/leads/editLead', leadData);
        return response.data;
    },

    deleteLead: async (leadId: string) => {
        const response = await api.delete(`/leads/${leadId}`);
        return response.data;
    },

    getLeads: async (queryParams: { page?: number; limit?: number; search?: string; status?: string; source?: string; sort?: string }) => {
        const response = await api.get('/leads/leadList', { params: queryParams });
        return response.data;
    },

    getLeadDetail: async (leadId: string) => {
        const response = await api.get(`/leads/leadDetail/${leadId}`);
        return response.data;
    },

    exportLeadsCSV: async (queryParams: { search?: string; status?: string; source?: string }) => {
        const response = await api.get('/leads/exportLeads', { 
            params: queryParams,
            responseType: 'blob'
        });
        return response.data;
    }
}