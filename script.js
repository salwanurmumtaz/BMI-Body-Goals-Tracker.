// script.js - BMI & Body Goals Tracker
// Kelompok 8 - Sistem Multimedia 2025

// ============================================
// INISIALISASI DAN FUNGSI UMUM
// ============================================

// Inisialisasi variabel global
let progressHistory = [];
let calorieEntries = [];
let totalCalories = 0;
let progressChart = null;
let weightGoal = null;

// Fungsi untuk scroll ke section tertentu
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// Fungsi untuk menampilkan notifikasi
function showNotification(message, type = 'info') {
    // Hapus notifikasi sebelumnya jika ada
    const existingNotif = document.querySelector('.notification');
    if (existingNotif) {
        existingNotif.remove();
    }
    
    // Buat notifikasi baru
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Tambahkan ke body
    document.body.appendChild(notification);
    
    // Tampilkan dengan animasi
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Hilangkan setelah 3 detik
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}

// Fungsi untuk menyimpan data ke localStorage
function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.error('Gagal menyimpan ke localStorage:', e);
    }
}

// Fungsi untuk mengambil data dari localStorage
function loadFromLocalStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (e) {
        console.error('Gagal mengambil dari localStorage:', e);
        return null;
    }
}

// ============================================
// KALKULATOR BMI
// ============================================

// Fungsi untuk menghitung BMI
function calculateBMI(weight, height) {
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    return bmi.toFixed(1);
}

// Fungsi untuk menentukan kategori BMI
function getBMICategory(bmi) {
    if (bmi < 18.5) {
        return {
            category: 'Underweight (Kurus)',
            advice: 'Disarankan untuk meningkatkan asupan kalori dengan makanan bergizi.',
            color: '#3498db'
        };
    } else if (bmi >= 18.5 && bmi <= 24.9) {
        return {
            category: 'Normal (Ideal)',
            advice: 'Selamat! Berat badan Anda ideal. Pertahankan pola hidup sehat.',
            color: '#2ecc71'
        };
    } else if (bmi >= 25 && bmi <= 29.9) {
        return {
            category: 'Overweight (Gemuk)',
            advice: 'Disarankan untuk mengurangi asupan kalori dan meningkatkan aktivitas fisik.',
            color: '#f39c12'
        };
    } else {
        return {
            category: 'Obese (Obesitas)',
            advice: 'Disarankan konsultasi dengan ahli gizi dan meningkatkan aktivitas fisik.',
            color: '#e74c3c'
        };
    }
}

// Event listener untuk form BMI
document.getElementById('bmiForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Ambil nilai input
    const name = document.getElementById('name').value;
    const age = document.getElementById('age').value;
    const weight = parseFloat(document.getElementById('weight').value);
    const height = parseFloat(document.getElementById('height').value);
    
    // Validasi input
    if (!name || !age || !weight || !height) {
        showNotification('Harap isi semua field!', 'error');
        return;
    }
    
    if (weight <= 0 || height <= 0) {
        showNotification('Berat dan tinggi harus lebih dari 0!', 'error');
        return;
    }
    
    // Hitung BMI
    const bmi = calculateBMI(weight, height);
    const category = getBMICategory(parseFloat(bmi));
    
    // Tampilkan hasil
    const resultDiv = document.getElementById('result');
    const bmiValue = resultDiv.querySelector('.bmi-value');
    const bmiCategory = resultDiv.querySelector('.bmi-category');
    const bmiAdvice = resultDiv.querySelector('.bmi-advice');
    
    bmiValue.innerHTML = `
        <div class="bmi-number">${bmi}</div>
        <div class="bmi-label">BMI Score</div>
    `;
    
    bmiCategory.innerHTML = `
        <span class="category-dot" style="background: ${category.color}"></span>
        <span class="category-text">${category.category}</span>
    `;
    
    bmiAdvice.textContent = category.advice;
    
    // Tampilkan hasil
    resultDiv.classList.remove('hidden');
    
    // Scroll ke hasil
    resultDiv.scrollIntoView({ behavior: 'smooth' });
    
    // Simpan data pengguna
    saveToLocalStorage('userData', { name, age, weight, height, bmi });
    
    // Tampilkan notifikasi
    showNotification(`BMI berhasil dihitung: ${bmi} (${category.category})`, 'success');
});

// ============================================
// BODY GOALS TRACKER
// ============================================

// Event listener untuk form target
document.getElementById('goalForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const targetWeight = parseFloat(document.getElementById('targetWeight').value);
    const targetDate = document.getElementById('targetDate').value;
    
    if (!targetWeight || !targetDate) {
        showNotification('Harap isi semua field!', 'error');
        return;
    }
    
    // Ambil berat saat ini dari form BMI
    const currentWeight = parseFloat(document.getElementById('weight')?.value);
    if (!currentWeight) {
        showNotification('Harap isi berat badan di kalkulator BMI terlebih dahulu!', 'error');
        scrollToSection('kalkulator');
        return;
    }
    
    // Simpan target
    weightGoal = {
        currentWeight,
        targetWeight,
        targetDate,
        startDate: new Date().toISOString().split('T')[0]
    };
    
    saveToLocalStorage('weightGoal', weightGoal);
    
    // Tampilkan hasil
    const goalResult = document.getElementById('goalResult');
    const goalInfo = goalResult.querySelector('.goal-info');
    
    const weightDiff = targetWeight - currentWeight;
    const action = weightDiff > 0 ? 'Naik' : 'Turun';
    
    goalInfo.innerHTML = `
        <p><strong>Target:</strong> ${action} ${Math.abs(weightDiff)} kg</p>
        <p><strong>Dari:</strong> ${currentWeight} kg → <strong>Menjadi:</strong> ${targetWeight} kg</p>
        <p><strong>Target Selesai:</strong> ${new Date(targetDate).toLocaleDateString('id-ID')}</p>
    `;
    
    goalResult.classList.remove('hidden');
    showNotification('Target berhasil disimpan!', 'success');
});

// Event listener untuk form progres
document.getElementById('progressForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const currentWeight = parseFloat(document.getElementById('currentWeight').value);
    const progressDate = document.getElementById('progressDate').value;
    
    if (!currentWeight || !progressDate) {
        showNotification('Harap isi semua field!', 'error');
        return;
    }
    
    // Tambahkan ke riwayat
    const progressEntry = {
        date: progressDate,
        weight: currentWeight
    };
    
    progressHistory.push(progressEntry);
    saveToLocalStorage('progressHistory', progressHistory);
    
    // Update tampilan riwayat
    updateProgressHistory();
    
    // Update grafik
    updateProgressChart();
    
    // Reset form
    document.getElementById('progressForm').reset();
    
    showNotification('Progres berhasil dicatat!', 'success');
});

// Fungsi untuk update riwayat progres
function updateProgressHistory() {
    const historyList = document.getElementById('historyList');
    if (!historyList) return;
    
    historyList.innerHTML = '';
    
    // Urutkan berdasarkan tanggal (terbaru dulu)
    progressHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Tampilkan maksimal 10 entri terbaru
    const recentHistory = progressHistory.slice(0, 10);
    
    recentHistory.forEach(entry => {
        const entryDiv = document.createElement('div');
        entryDiv.className = 'history-entry';
        entryDiv.innerHTML = `
            <span class="history-date">${new Date(entry.date).toLocaleDateString('id-ID')}</span>
            <span class="history-weight">${entry.weight} kg</span>
        `;
        historyList.appendChild(entryDiv);
    });
}

// Fungsi untuk update grafik
function updateProgressChart() {
    const ctx = document.getElementById('progressChart')?.getContext('2d');
    if (!ctx) return;
    
    // Urutkan berdasarkan tanggal (lama ke baru)
    const sortedHistory = [...progressHistory].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Siapkan data
    const dates = sortedHistory.map(entry => 
        new Date(entry.date).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })
    );
    const weights = sortedHistory.map(entry => entry.weight);
    
    // Hancurkan chart sebelumnya jika ada
    if (progressChart) {
        progressChart.destroy();
    }
    
    // Buat chart baru
    progressChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Berat Badan (kg)',
                data: weights,
                borderColor: '#4CAF50',
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Berat Badan (kg)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Tanggal'
                    }
                }
            }
        }
    });
}

// ============================================
// MANAJEMEN KALORI
// ============================================

// Event listener untuk form BMR
document.getElementById('bmrForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    calculateBMR();
});

// Event listener untuk form kalori
document.getElementById('calorieForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    addCalorieEntry();
});

// Fungsi untuk menghitung BMR
function calculateBMR() {
    const gender = document.getElementById('gender').value;
    const activity = parseFloat(document.getElementById('activity').value);
    
    if (!gender || !activity) {
        showNotification('Harap pilih jenis kelamin dan tingkat aktivitas!', 'error');
        return;
    }
    
    // Ambil data dari form BMI
    const weight = parseFloat(document.getElementById('weight')?.value);
    const height = parseFloat(document.getElementById('height')?.value);
    const age = parseInt(document.getElementById('age')?.value);
    
    if (!weight || !height || !age) {
        showNotification('Harap isi berat badan, tinggi badan, dan umur di kalkulator BMI terlebih dahulu!', 'error');
        scrollToSection('kalkulator');
        return;
    }
    
    // Hitung BMR (Mifflin-St Jeor Equation)
    let bmr;
    if (gender === 'male') {
        bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
    } else {
        bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
    }
    
    // Kalikan dengan faktor aktivitas
    const dailyCalories = Math.round(bmr * activity);
    
    // Tampilkan hasil
    const bmrResult = document.getElementById('bmrResult');
    const calorieValue = bmrResult.querySelector('.calorie-value');
    const calorieAdvice = bmrResult.querySelector('.calorie-advice');
    
    calorieValue.innerHTML = `
        <div class="calorie-number">${dailyCalories} kkal</div>
        <div class="calorie-desc">Kalori per hari</div>
    `;
    
    let advice = '';
    if (dailyCalories < 1500) {
        advice = 'Pola makan ini cocok untuk penurunan berat badan yang sehat';
    } else if (dailyCalories < 2000) {
        advice = 'Pola makan ini cocok untuk menjaga berat badan ideal';
    } else {
        advice = 'Pola makan ini cocok untuk menambah massa otot';
    }
    
    calorieAdvice.textContent = advice;
    bmrResult.classList.remove('hidden');
    
    // Scroll ke hasil
    bmrResult.scrollIntoView({ behavior: 'smooth' });
    
    showNotification(`Kebutuhan kalori harian: ${dailyCalories} kkal`, 'success');
}

// Fungsi untuk menambahkan entri kalori
function addCalorieEntry() {
    const foodName = document.getElementById('foodName').value.trim();
    const calories = parseInt(document.getElementById('calories').value);
    
    if (!foodName || !calories || calories <= 0) {
        showNotification('Harap isi nama makanan dan kalori dengan benar!', 'error');
        return;
    }
    
    // Tambahkan ke total kalori
    totalCalories += calories;
    document.getElementById('totalCalories').textContent = `${totalCalories} kkal`;
    
    // Tambahkan ke array entries
    const entry = {
        food: foodName,
        calories: calories,
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };
    calorieEntries.push(entry);
    
    // Update tampilan
    updateCalorieList();
    
    // Reset form
    document.getElementById('calorieForm').reset();
    
    // Tampilkan notifikasi sukses
    showNotification('Kalori berhasil ditambahkan!', 'success');
}

// Fungsi untuk update daftar kalori
function updateCalorieList() {
    const calorieList = document.getElementById('calorieList');
    if (!calorieList) return;
    
    calorieList.innerHTML = '';
    
    calorieEntries.forEach((entry, index) => {
        const entryDiv = document.createElement('div');
        entryDiv.className = 'calorie-entry';
        entryDiv.innerHTML = `
            <span class="food-name">${entry.food}</span>
            <span class="food-calories">${entry.calories} kkal</span>
            <span class="food-time">${entry.time}</span>
            <button class="delete-btn" onclick="deleteCalorieEntry(${index})">×</button>
        `;
        calorieList.appendChild(entryDiv);
    });
}

// Fungsi untuk menghapus entri kalori
function deleteCalorieEntry(index) {
    // Kurangi total kalori
    totalCalories -= calorieEntries[index].calories;
    document.getElementById('totalCalories').textContent = `${totalCalories} kkal`;
    
    // Hapus dari array
    calorieEntries.splice(index, 1);
    
    // Update tampilan
    updateCalorieList();
    
    showNotification('Entri kalori dihapus', 'info');
}

// ============================================
// ANIMASI DAN EFFECT
// ============================================

// Animasi untuk hero section
function startHeroAnimation() {
    const exerciseGirl = document.querySelector('.exercise-girl');
    if (exerciseGirl) {
        setTimeout(() => {
            exerciseGirl.classList.add('active');
        }, 500);
    }
    
    // Animasi floating icons
    const icons = document.querySelectorAll('.floating-icons .icon');
    icons.forEach((icon, index) => {
        icon.style.animationDelay = `${index * 0.5}s`;
    });
}

// ============================================
// INISIALISASI SAAT HALAMAN DIMUAT
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Load data dari localStorage
    const savedProgress = loadFromLocalStorage('progressHistory');
    if (savedProgress) {
        progressHistory = savedProgress;
        updateProgressHistory();
        updateProgressChart();
    }
    
    const savedGoal = loadFromLocalStorage('weightGoal');
    if (savedGoal) {
        weightGoal = savedGoal;
        const goalResult = document.getElementById('goalResult');
        const goalInfo = goalResult.querySelector('.goal-info');
        
        const weightDiff = savedGoal.targetWeight - savedGoal.currentWeight;
        const action = weightDiff > 0 ? 'Naik' : 'Turun';
        
        goalInfo.innerHTML = `
            <p><strong>Target:</strong> ${action} ${Math.abs(weightDiff)} kg</p>
            <p><strong>Dari:</strong> ${savedGoal.currentWeight} kg → <strong>Menjadi:</strong> ${savedGoal.targetWeight} kg</p>
            <p><strong>Target Selesai:</strong> ${new Date(savedGoal.targetDate).toLocaleDateString('id-ID')}</p>
        `;
        
        goalResult.classList.remove('hidden');
    }
    
    const savedCalories = loadFromLocalStorage('calorieEntries');
    if (savedCalories) {
        calorieEntries = savedCalories;
        totalCalories = calorieEntries.reduce((sum, entry) => sum + entry.calories, 0);
        document.getElementById('totalCalories').textContent = `${totalCalories} kkal`;
        updateCalorieList();
    }
    
    // Set tanggal minimum untuk input date
    const today = new Date().toISOString().split('T')[0];
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => {
        input.min = today;
        input.value = today;
    });
    
    // Inisialisasi animasi
    startHeroAnimation();
    
    // Smooth scroll untuk navigation links
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            scrollToSection(targetId);
        });
    });
    
    // Auto-save data secara berkala
    setInterval(() => {
        saveToLocalStorage('progressHistory', progressHistory);
        saveToLocalStorage('weightGoal', weightGoal);
        saveToLocalStorage('calorieEntries', calorieEntries);
    }, 30000); // Setiap 30 detik
    
    console.log('Aplikasi BMI & Body Goals Tracker berhasil dimuat!');
});