// ============================================================
// College Predictor — Application Constants
// ============================================================

export const CATEGORIES = [
  'General',
  'OBC-NCL',
  'SC',
  'ST',
  'EWS',
  'PwD',
] as const;

export const GENDERS = ['Male', 'Female', 'Other'] as const;

export const COLLEGE_TYPES = [
  'Government',
  'Private',
  'Deemed',
  'IIT',
  'NIT',
  'IIIT',
  'Other',
] as const;

export const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
] as const;

export const APP_NAME = 'College Predictor';
export const APP_DESCRIPTION =
  'Discover colleges and branches you may be eligible for based on your examination rank and historical cutoff data.';

export const ITEMS_PER_PAGE = 20;
