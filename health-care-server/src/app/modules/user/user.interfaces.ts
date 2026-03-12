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
