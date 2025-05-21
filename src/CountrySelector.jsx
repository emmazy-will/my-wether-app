import React, { useState } from 'react';
import { COUNTRIES } from './countries';

const CountrySelector = ({ onSelect }) => {
  const [selectedCountry, setSelectedCountry] = useState('');

  const handleChange = (e) => {
    const countryCode = e.target.value;
    setSelectedCountry(countryCode);
    if (countryCode) {
      const country = COUNTRIES.find(c => c.code === countryCode);
      onSelect(country);
    }
  };

  return (
    <div className="country-selector">
      <select 
        value={selectedCountry} 
        onChange={handleChange}
        className="select-box"
      >
        <option value="">Select a country</option>
        {COUNTRIES.map((country) => (
          <option key={country.code} value={country.code}>
            {country.name} ({country.capital})
          </option>
        ))}
      </select>
    </div>
  );
};

export default CountrySelector;