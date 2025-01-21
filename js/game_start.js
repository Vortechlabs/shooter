const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = 1000;
canvas.height = 600;

// Sembunyikan pointer default
canvas.style.cursor = 'none';

const background = new Sprite({
    position: { x: 0, y: 0 },
    imageSrc: './Sprites/background.jpg'
});

// Kelas untuk pointer
class Pointer {
    constructor(imageSrc) {
        this.image = new Image();
        this.image.src = imageSrc; // Ganti dengan path gambar pointer Anda
        this.position = { x: 0, y: 0 }; // Posisi pointer
    }

    draw() {
        c.drawImage(this.image, this.position.x, this.position.y, 30, 30); // Gambar pointer
    }
}

// Kelas untuk pistol
class Gun {
    constructor() {
        this.position = {
            x: canvas.width / 2 - 100, // Posisi awal di tengah
            y: canvas.height - 250 // Posisi di bawah
        };
        this.width = 300; // Lebar pistol
        this.height = 250; // Tinggi pistol
        this.image = new Image();
        this.image.src = '../Sprites/gun1.png'; // Ganti dengan path gambar pistol Anda
    }

    draw() {
        c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
    }
}

// Kelas untuk target
class Target {
    constructor(imageSrc) {
        this.position = {
            x: Math.random() * (canvas.width - 50),
            y: Math.random() * (canvas.height - 50)
        };
        this.size = 100; 
        this.hit = false; 
        this.image = new Image();
        this.image.src = imageSrc;
    }

    draw() {
        if (this.hit) return; 
        c.drawImage(this.image, this.position.x, this.position.y, this.size, this.size);
    }

    isHit(bullet) {
        const distance = Math.sqrt((bullet.x - this.position.x) ** 2 + (bullet.y - this.position.y) ** 2);
        return distance < this.size;
    }
}

// Kelas untuk peluru
class Bullet {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 5;
        this.speed = 5; // Kecepatan peluru
    }

    draw() {
        c.fillStyle = 'yellow';
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        c.fill();
    }

    update() {
        this.y -= this.speed; // Gerakkan peluru ke atas
    }
}

// Kelas untuk efek ledakan
class Explosion {
    constructor(x, y, imageSrc) {
        this.position = { x, y };
        this.image = new Image();
        this.image.src = imageSrc; // Ganti dengan path gambar efek ledakan
        this.size = 80; // Ukuran efek ledakan
        this.duration = 300; // Durasi efek dalam milidetik
        this.startTime = Date.now(); // Waktu mulai efek
    }

    draw() {
        c.drawImage(this.image, this.position.x, this.position.y, this.size, this.size);
    }

    isExpired() {
        return Date.now() - this.startTime > this.duration; // Cek apakah efek sudah habis
    }
}

const gun = new Gun();
const pointer = new Pointer('../Sprites/pointer.png'); // Ganti dengan path gambar pointer Anda
const targets = [];
const bullets = [];
const explosions = [];
let score = 0;
let timeLeft = 30; // Waktu permainan dalam detik
let gameInterval;


const shootSound = new Audio('../Sound/gunshot-sound-effect.mp3'); 

// Inisialisasi target
function initTargets() {
    for (let i = 0; i < 5; i++) {
        targets.push(new Target('../Sprites/target1.png')); // Ganti dengan path gambar target Anda
    }
}

// Menangani tembakan
canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // Buat peluru baru
    bullets.push(new Bullet(mouseX, mouseY));
    
    
    // Putar suara tembakan
    shootSound.currentTime = 0; // Reset suara ke awal
    shootSound.play(); // Putar suara
});

// Menangani gerakan mouse untuk memperbarui posisi pointer
canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    pointer.position.x = event.clientX - rect.left - 15; // Offset untuk menempatkan pointer di tengah
    pointer.position.y = event.clientY - rect.top - 15; // Offset untuk menempatkan pointer di tengah
});

// Menggambar skor
function drawScore() {
    const scoreElement = document.getElementById('score');
    scoreElement.innerText = score;
}

// Menggambar waktu
function drawTime() {
    const timerElement = document.getElementById('timer');
    timerElement.innerText = timeLeft;
}

// Fungsi animasi
function animate() {
    c.clearRect(0, 0, canvas.width, canvas.height);
    background.draw();
    
    // Gambar target terlebih dahulu
    targets.forEach((target) => {
        target.draw();
    });

    // Gambar pistol
    gun.draw(); 

    // Gambar pointer
    pointer.draw(); 

    // Cek apakah peluru mengenai target
    bullets.forEach((bullet, bulletIndex) => {
        bullet.update();
        bullet.draw();

        let hitTarget = false; // Variabel untuk mengecek apakah peluru mengenai target

        targets.forEach((target, targetIndex) => {
            if (target.isHit(bullet)) {
                target.hit = true; // Tandai target sebagai terkena
                score++; // Tambah skor
                bullets.splice(bulletIndex, 1); // Hapus peluru setelah mengenai target
                targets.splice(targetIndex, 1); // Hapus target setelah terkena

                // Tambahkan efek ledakan
                explosions.push(new Explosion(target.position.x, target.position.y, '../Sprites/boom.png')); // Ganti dengan path gambar efek ledakan
                hitTarget = true; // Tandai bahwa peluru mengenai target
            }
        });

        // Hapus peluru jika keluar dari canvas
        if (bullet.y < 0) {
            bullets.splice(bulletIndex, 1);
            if (!hitTarget) {
                timeLeft = Math.max(0, timeLeft - 5); // Kurangi waktu 5 detik jika tidak mengenai target
            }
        }
    });

    // Gambar efek ledakan
    explosions.forEach((explosion, explosionIndex) => {
        explosion.draw();
        if (explosion.isExpired()) {
            explosions.splice(explosionIndex, 1); // Hapus efek setelah durasi habis
        }
    });

    drawScore();
    drawTime();

    // Cek kondisi kemenangan
    if (targets.length === 0) {
        clearInterval(gameInterval);
        document.getElementById('game-status').style.display = 'block';
        document.getElementById('final-score').innerText = `Your Score is: ${score}`;
        document.getElementById('final-score').style.display = 'block';
    }

    // Cek waktu
    if (timeLeft <= 0) {
        clearInterval(gameInterval);
        document.getElementById('time-over').style.display = 'block';
        document.getElementById('final-score').innerText = `Your Score is: ${score}`;
        document.getElementById('final-score').style.display = 'block';
    }
}

// Memulai permainan
function startGame() {
    initTargets();
    gameInterval = setInterval(() => {
        if (timeLeft > 0) {
            animate();
        }
    }, 1000 / 60); // 60 FPS

    // Timer
    setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
        }
    }, 1000); 
}

// Memulai permainan saat halaman dimuat
window.onload = startGame;