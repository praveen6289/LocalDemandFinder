export default function FilterBar({
  location,
  onLocationChange,
  locations,
  searchValue,
  onSearchChange
}) {
  return (
    <div className="filter-bar card">
      <label>
        <span>Location</span>
        <select value={location} onChange={(event) => onLocationChange(event.target.value)}>
          <option value="">All markets</option>
          {locations.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span>Search</span>
        <input
          type="text"
          placeholder="Filter by product or category"
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </label>
    </div>
  );
}

