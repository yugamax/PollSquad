export const indianCities = [
  // Major Metro Cities
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Pune',
  'Jaipur', 'Surat', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal',
  'Visakhapatnam', 'Pimpri-Chinchwad', 'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana',
  'Agra', 'Nashik', 'Faridabad', 'Meerut', 'Rajkot', 'Kalyan-Dombivali', 'Vasai-Virar',
  'Varanasi', 'Srinagar', 'Dhanbad', 'Jodhpur', 'Amritsar', 'Raipur', 'Allahabad',
  'Coimbatore', 'Jabalpur', 'Gwalior', 'Vijayawada', 'Madurai', 'Guwahati', 'Chandigarh',
  'Hubli-Dharwad', 'Amroha', 'Moradabad', 'Gurgaon', 'Aligarh', 'Solapur', 'Ranchi',
  'Jalandhar', 'Tiruchirappalli', 'Bhubaneswar', 'Salem', 'Warangal', 'Mira-Bhayandar',
  'Thiruvananthapuram', 'Bhiwandi', 'Saharanpur', 'Guntur', 'Amravati', 'Bikaner',
  'Noida', 'Jamshedpur', 'Bhilai Nagar', 'Cuttack', 'Firozabad', 'Kochi', 'Nellore',
  'Bhavnagar', 'Dehradun', 'Durgapur', 'Asansol', 'Rourkela', 'Nanded', 'Kolhapur',
  'Ajmer', 'Akola', 'Gulbarga', 'Jamnagar', 'Ujjain', 'Loni', 'Siliguri', 'Jhansi',
  'Ulhasnagar', 'Jammu', 'Sangli-Miraj & Kupwad', 'Mangalore', 'Erode', 'Belgaum',
  'Ambattur', 'Tirunelveli', 'Malegaon', 'Gaya', 'Jalgaon', 'Udaipur', 'Maheshtala',
  
  // State Capitals and Important Cities
  'Shimla', 'Gandhinagar', 'Panaji', 'Imphal', 'Shillong', 'Aizawl', 'Kohima', 'Itanagar',
  'Dispur', 'Agartala', 'Gangtok', 'Port Blair', 'Kavaratti', 'Daman', 'Silvassa',
  'Puducherry', 'Leh', 'Kargil',
  
  // Other Major Cities
  'Mysore', 'Bareilly', 'Aligarh', 'Gorakhpur', 'Bikaner', 'Rampur', 'Shahjahanpur',
  'Farrukhabad', 'Anantapur', 'Bellary', 'Brahmapur', 'Karimnagar', 'Vellore',
  'Ernakulam', 'Thrissur', 'Kozhikode', 'Tuticorin', 'Kurnool', 'Rajahmundry',
  'Kadapa', 'Kakinada', 'Nizamabad', 'Secunderabad', 'Khammam', 'Ahmednagar',
  'Chandrapur', 'Parbhani', 'Ichalkaranji', 'Jalna', 'Ambernath', 'Bhusawal',
  'Panihati', 'Kamarhati', 'Serampore', 'Raiganj', 'Barddhaman', 'Naihati',
  'Midnapore', 'Haldia', 'Balurghat', 'Basirhat', 'Bankura', 'Purulia',
  'Tamluk', 'Jangipur', 'Bolpur', 'Bangaon', 'Cooch Behar'
].sort() // Sort alphabetically for better user experience

export function searchCities(query: string): string[] {
  if (!query || query.trim().length === 0) {
    return indianCities.slice(0, 10) // Show first 10 cities when no query
  }
  
  const normalizedQuery = query.toLowerCase().trim()
  
  // First, find exact matches at the beginning
  const exactMatches = indianCities.filter(city => 
    city.toLowerCase().startsWith(normalizedQuery)
  )
  
  // Then, find partial matches (contains query but doesn't start with it)
  const partialMatches = indianCities.filter(city => 
    city.toLowerCase().includes(normalizedQuery) && 
    !city.toLowerCase().startsWith(normalizedQuery)
  )
  
  // Combine exact matches first, then partial matches
  const allMatches = [...exactMatches, ...partialMatches]
  
  return allMatches.slice(0, 10) // Limit to 10 results for performance
}
