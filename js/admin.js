document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('addPuppyForm');
  const tableBody = document.getElementById('adminPuppyTableBody');

  if (typeof supabaseClient === 'undefined') {
    alert("CRITICAL ERROR: Supabase is not initialized. Check your network or supabase-client.js");
    return;
  }

  // Load data from Supabase
  async function renderTable() {
    tableBody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding: 2rem;"><i class="fas fa-spinner fa-spin"></i> Fetching from database...</td></tr>';

    try {
      const { data: puppies, error } = await supabaseClient
        .from('puppies')
        .select('*')
        .order('id', { ascending: false });

      if (error) throw error;

      tableBody.innerHTML = '';

      if (!puppies || puppies.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding: 2rem;">No puppies found in database. Add one!</td></tr>';
        return;
      }

      puppies.forEach((puppy) => {
        const tr = document.createElement('tr');
        tr.setAttribute('data-id', puppy.id);
        tr.innerHTML = `
          <td>${puppy.id}</td>
          <td><img src="${puppy.image_url}" alt="${puppy.breed}"></td>
          <td><strong>${puppy.tracking_code}</strong></td>
          <td>${puppy.name || '-'}</td>
          <td>${puppy.breed}</td>
          <td>$${parseInt(puppy.price).toLocaleString()}</td>
          <td>${puppy.gender}</td>
          <td>
            <button class="action-btn delete-btn" data-id="${puppy.id}" title="Delete">
              <i class="fas fa-trash-alt"></i>
            </button>
          </td>
        `;
        tableBody.appendChild(tr);
      });

      // Attach delete listeners after rendering
      tableBody.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', handleDelete);
      });

    } catch(err) {
      console.error(err);
      const msg = err.message || "Unknown error connecting to database";
      tableBody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 2rem; color:red;">
        <i class="fas fa-exclamation-triangle"></i> Database Error: ${msg}<br>
        <small>Please ensure the "puppies" table exists in Supabase with the correct columns.</small>
      </td></tr>`;
    }
  }

  // Instant delete — no confirm dialog, immediate visual feedback
  async function handleDelete(e) {
    const btn = e.currentTarget;
    const id = btn.getAttribute('data-id');
    const row = tableBody.querySelector(`tr[data-id="${id}"]`);

    // Instant visual feedback — disable button & fade row
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    if (row) {
      row.style.opacity = '0.4';
      row.style.transition = 'opacity 0.2s ease';
    }

    try {
      const { data, error } = await supabaseClient
        .from('puppies')
        .delete()
        .eq('id', parseInt(id))
        .select();

      if (error) throw error;
      
      if (!data || data.length === 0) {
        throw new Error("No rows were deleted. This usually means you don't have database permission (RLS) or it was already deleted.");
      }

      // Animate row out then remove — no full page reload
      if (row) {
        row.style.opacity = '0';
        row.style.transform = 'translateX(30px)';
        row.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        setTimeout(() => {
          row.remove();
          // Show empty message if no rows left
          if (tableBody.querySelectorAll('tr[data-id]').length === 0) {
            tableBody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding: 2rem;">No puppies found in database. Add one!</td></tr>';
          }
        }, 300);
      }

    } catch(err) {
      console.error(err);
      // Restore row on failure
      if (row) {
        row.style.opacity = '1';
        row.style.transform = '';
      }
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-trash-alt"></i>';
      alert("Error deleting puppy: " + err.message);
    }
  }

  // Handle Form Submit to Supabase
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
    submitBtn.disabled = true;
    
    const fileInput = document.getElementById('image_file');
    const file = fileInput.files[0];

    if (!file) {
      alert("Please select an image");
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
      return;
    }

    try {
      // 1. Upload image to Supabase Storage
      const fileName = `${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabaseClient.storage
        .from('puppy-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // 2. Get public URL
      const { data: urlData } = supabaseClient.storage
        .from('puppy-images')
        .getPublicUrl(uploadData.path);

      const imageUrl = urlData.publicUrl;

      // 3. Generate Tracking Code
      const trackingCode = "TRK" + Math.floor(Math.random() * 1000000);

      const newPuppy = {
        name: document.getElementById('pName').value,
        breed: document.getElementById('pBreed').value,
        age: document.getElementById('pAge').value,
        gender: document.getElementById('pGender').value,
        price: parseInt(document.getElementById('pPrice').value),
        tracking_code: trackingCode,
        image_url: imageUrl
      };

      const { data, error } = await supabaseClient
        .from('puppies')
        .insert([newPuppy]);
        
      if (error) throw error;
      
      form.reset();
      await renderTable();
      alert(`Puppy posted successfully! Tracking Code: ${trackingCode}`);
    } catch(err) {
      console.error(err);
      alert("Error processing request: " + err.message);
    } finally {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  });

  // Legacy window.deletePuppy kept for compatibility
  window.deletePuppy = async function(id) {
    const fakeBtn = document.querySelector(`button[data-id="${id}"]`);
    if (fakeBtn) fakeBtn.click();
  };

  // Factory Reset — deletes ALL puppies from the database
  window.clearData = async function() {
    const confirmed = confirm("⚠️ FACTORY RESET: This will permanently delete ALL puppies from the database. Are you absolutely sure?");
    if (!confirmed) return;

    const doubleCheck = confirm("This cannot be undone. Click OK to delete everything.");
    if (!doubleCheck) return;

    try {
      // Delete all rows - Supabase requires a filter, so we use id > 0
      const { error } = await supabaseClient
        .from('puppies')
        .delete()
        .gt('id', 0);

      if (error) throw error;

      tableBody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding: 2rem;">No puppies found in database. Add one!</td></tr>';
      alert("✅ Factory reset complete. All puppies have been removed.");
    } catch(err) {
      console.error(err);
      alert("Error during factory reset: " + err.message);
    }
  };

  // Initial render
  renderTable();
});
