export interface ICreatePatientRequest {
  password: string;
  patient: {
    email: string;
    name: string;
    contactNumber: string;
    profilePhoto?: string;
    address?: string;
  };
}

export interface IFilters {
  searchTerm?: string;
  email?: string;
  role?: string;
  status?: string;
}

export interface IOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
