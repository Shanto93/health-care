export interface ICreatePatientRequest {
  password: string;
  email: string;
  name: string;
  contactNumber: string;
  profilePhoto?: string;
  address?: string;
}