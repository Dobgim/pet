document.addEventListener('DOMContentLoaded', async () => {
  const grid = document.getElementById('puppiesGrid');
  const breedFilter = document.getElementById('filterBreed');
  const priceFilter = document.getElementById('filterMaxPrice');
  const resetBtn = document.getElementById('resetFilters');

  let puppies = [];

  // Show a loading indicator while fetching from Supabase
  if (grid) {
    grid.innerHTML = '<div style="text-align:center; padding: 4rem; width: 100%; color: var(--text-muted);"><i class="fas fa-spinner fa-spin fa-2x"></i><p style="margin-top: 10px;">Loading gallery from database...</p></div>';
  }

  // Fetch puppies from Supabase
  async function fetchPuppies() {
    try {
      const { data, error } = await supabaseClient
        .from('puppies')
        .select('*')
        .order('id', { ascending: false }); // Show newest first
        
      if (error) throw error;
      puppies = data || [];
      
      if (grid) {
        populateBreedFilter(puppies);
        renderPuppies(puppies);
      }
    } catch (e) {
      console.error("Error fetching from Supabase:", e);
      if (grid) {
        grid.innerHTML = '<div class="no-results" style="color: red;">Error connecting to the database. Make sure your "puppies" table exists in Supabase.</div>';
      }
    }
  }

  // Dynamically Populate Breed Categories
  function populateBreedFilter(data) {
    if (!breedFilter) return;
    
    // Get unique breeds from the current puppy data
    const uniqueBreeds = [...new Set(data.map(p => p.breed))].sort();
    
    // Keep 'All Breeds' option, clear the rest
    breedFilter.innerHTML = '<option value="All">All Breeds</option>';
    
    uniqueBreeds.forEach(breed => {
      const option = document.createElement('option');
      option.value = breed;
      option.textContent = breed;
      breedFilter.appendChild(option);
    });
  }

  function renderPuppies(data) {
    grid.innerHTML = '';

    if (data.length === 0) {
      grid.innerHTML = '<div class="no-results">No puppies found in the database. Add some from the admin dashboard!</div>';
      return;
    }

    data.forEach(puppy => {
      const card = document.createElement('div');
      card.className = 'puppy-card fade-in visible';
      
      const badge = `<div class="puppy-badge">New Arrival</div>`;
        
      card.innerHTML = `
        <div class="puppy-img-container">
          <img src="${puppy.image_url}" alt="${puppy.name || puppy.breed}">
          ${badge}
        </div>
        <div class="puppy-details">
          <h3 class="puppy-name">${puppy.name || puppy.breed}</h3>
          <div class="puppy-specs">
            <span class="spec"><i class="fas fa-paw"></i> ${puppy.breed}</span>
            <span class="spec"><i class="fas fa-clock"></i> ${puppy.age}</span>
            <span class="spec"><i class="fas fa-venus-mars"></i> ${puppy.gender}</span>
          </div>
          <div class="puppy-price">$${parseInt(puppy.price).toLocaleString()}</div>
          <a href="adoption.html?tracking=${puppy.tracking_code}" class="btn btn-primary btn-reserve">Start Adoption</a>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  function applyFilters() {
    const breed = breedFilter.value;
    const maxPrice = priceFilter.value ? parseInt(priceFilter.value) : Infinity;

    const filtered = puppies.filter(p => {
      const matchBreed = breed === 'All' || p.breed === breed;
      const matchPrice = parseInt(p.price) <= maxPrice;
      return matchBreed && matchPrice;
    });

    renderPuppies(filtered);
  }

  // Event Listeners
  if (breedFilter) breedFilter.addEventListener('change', applyFilters);
  if (priceFilter) priceFilter.addEventListener('input', applyFilters);
  
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      breedFilter.value = 'All';
      priceFilter.value = '';
      applyFilters();
    });
  }

  // Initial Fetch
  fetchPuppies();
});
