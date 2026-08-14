export interface Partner {
  id:          string;
  nom:         string;
  email:       string;
  pays:        string;
  apiKey:      string;
  isActive:    boolean;
  prefixes:    string[];
  createdAt:   string;
  updatedAt:   string;
}

export interface PartnerSummary {
  id:       string;
  nom:      string;
  pays:     string;
  isActive: boolean;
}
