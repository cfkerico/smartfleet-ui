export interface Driver {
  id?: number;
  civilite: string;
  nom: string;
  prenom: string;
  email: string;
  mobilePhoneNumber: string;
  adresse: string;
  licenseNumber: string;
  licenseExpirationDate: Date | null;
  hireDate: Date | null;
  status: string;
  workedDays: number;
  companyId: number;
}