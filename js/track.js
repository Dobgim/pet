async function searchPuppy() {
  const query = document.getElementById("search_code").value.trim();
  const resultContainer = document.getElementById("result_container");

  if (!query) {
    alert("Please enter a puppy name or tracking code");
    return;
  }

  // Show loading or just clear previous
  resultContainer.style.display = "none";

  try {
    // Try to find by name first, then fall back to tracking_code
    let { data, error } = await supabaseClient
      .from('puppies')
      .select('*')
      .ilike('name', query)
      .limit(1)
      .single();

    // If not found by name, try tracking code
    if (error || !data) {
      const result = await supabaseClient
        .from('puppies')
        .select('*')
        .eq('tracking_code', query.toUpperCase())
        .single();
      data = result.data;
      error = result.error;
    }

    if (error || !data) {
      alert("Puppy not found. Please check the name or tracking code.");
      return;
    }

    // Populate data
    document.getElementById("puppy_name").innerText = data.name || data.breed;
    document.getElementById("breed").innerText = data.breed;
    document.getElementById("age").innerText = data.age;
    document.getElementById("gender").innerText = data.gender;
    document.getElementById("price").innerText = `$${parseInt(data.price).toLocaleString()}`;
    document.getElementById("tracking_display").innerText = data.tracking_code;
    document.getElementById("image").src = data.image_url;

    // Show result
    resultContainer.style.display = "flex";
    resultContainer.scrollIntoView({ behavior: 'smooth' });

  } catch (err) {
    console.error(err);
    alert("An error occurred while fetching the puppy details.");
  }
}

// Allow pressing Enter to search
document.getElementById("search_code").addEventListener("keypress", function(e) {
  if (e.key === "Enter") {
    searchPuppy();
  }
});
