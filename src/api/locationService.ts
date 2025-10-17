import axios from 'axios';

const COUNTRIES_API_BASE_URL = 'https://countriesnow.space/api/v0.1';

export interface State {
  name: string;
  state_code: string;
}

export interface CountryStatesResponse {
  error: boolean;
  msg: string;
  data: {
    name: string;
    iso3: string;
    iso2: string;
    states: State[];
  };
}

export interface CitiesResponse {
  error: boolean;
  msg: string;
  data: string[];
}

export const locationService = {
  // Fetch states for a country
  getStates: async (country: string = 'India'): Promise<State[]> => {
    try {
      const response = await axios.post<CountryStatesResponse>(
        `${COUNTRIES_API_BASE_URL}/countries/states`,
        { country }
      );
      
      if (response.data.error) {
        throw new Error(response.data.msg);
      }
      
      return response.data.data.states;
    } catch (error) {
      console.error('Error fetching states:', error);
      throw new Error('Failed to fetch states');
    }
  },

  // Fetch cities for a state in a country
  getCities: async (country: string = 'India', state: string): Promise<string[]> => {
    try {
      const response = await axios.post<CitiesResponse>(
        `${COUNTRIES_API_BASE_URL}/countries/state/cities`,
        { country, state }
      );
      
      if (response.data.error) {
        throw new Error(response.data.msg);
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Error fetching cities:', error);
      throw new Error('Failed to fetch cities');
    }
  }
};
