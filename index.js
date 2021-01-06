
const canvas = document.querySelector('canvas');

const c = canvas.getContext('2d')
canvas.width = window.innerWidth
canvas.height = window.innerHeight
const scorepoint = document.querySelector('#scorepoint')
const startGameBt = document.querySelector('#startGameBt');
const modal = document.querySelector('#modal');
const bigscorepoint = document.querySelector('#bigscorepoint')




class Player {
    constructor(x, y, radius, color) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
    }
    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color
        c.fill()
    }
}

class Projectile {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }
    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color
        c.fill()
    }

    update() {
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}

class Enemy {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }
    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color
        c.fill()
    }

    update() {  
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}
//tạo hiệu ứng mảnh vỡ bay chậm
const friction = 0.99
class Particle {
    constructor(x, y, radius, color, velocity) {
        // c.save()
        c.globalAlpha = this.alpha
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity    
        this.alpha = 1
        // c.restore()
    }
    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color
        c.fill()
    }

    update() {
        this.draw()
        this.velocity.x *= friction
        this.velocity.y *= friction
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
        this.alpha -= 0.01
    }
}

const x = canvas.width / 2
const y = canvas.height /2



// const projectile = new Projectile (canvas.width / 2, canvas.height / 2 , 5, 'red', {
//     x: 1,
//     y: 1
// })
// const projectile2 = new Projectile (canvas.width / 2, canvas.height / 2 , 5, 'green', {
//     x: -1,
//     y: -1
// })

let player = new Player(x, y, 15, 'white')
let projectiles = []
let enemies = []
let particles = []

//hàm khởi tạo
function init() {
    player = new Player(x, y, 15, 'white')
    projectiles = []
    enemies = []
    particles = []
    score = 0
    scorepoint.innerHTML = score
    bigscorepoint.innerHTML = score
}

player.draw();

//hàm tạo kẻ địch
function spawnEnemies() {
    setInterval(() => {
    const radius = Math.random() * 26 + 4
    let x 
    let y
    if (Math.random() < 0.5) {
        x = Math.random() < 0.5? 0 - radius : canvas.width + radius
        y = Math.random() * canvas.height
    } else {
        x = Math.random() * canvas.width
        y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius
    }
    const color = `hsl(${Math.random()*360}, 50%, 50%)`
    const angle = Math.atan2(
        canvas.height / 2 - y,
        canvas.width /2 -x)
    const velocity = {
        x: Math.cos(angle),
        y: Math.sin(angle),
    }
    enemies.push(new Enemy(x, y, radius, color, velocity))
    console.log(enemies)  
    }, 2000)
}

let animateID
let score = 0

//hàm vẽ chuyển động animation
function animate(){
    animationID = requestAnimationFrame(animate);
    c.fillStyle = 'rgba(0, 0, 0, 0.1)'
    c.fillRect(0, 0, canvas.width, canvas.height)
    player.draw()
    // projectile.draw();
    // projectile.update()
    particles.forEach((particle, index) => {
        if(particle.alpha <= 0){
            particles.splice(index, 1)
        } else {
            particle.update()
        }
    })

    projectiles.forEach((projectile, index) => {
        projectile.update() 
        if(projectile.x + projectile.radius < 0 ||
            projectile.x - projectile.radius >canvas.width ||
            projectile.y + projectile.radius < 0 ||
            projectile.y - projectile.radius > canvas.height    
            ){
            setTimeout(() => {
                projectiles.splice(index, 1)
                }, 0)
        }
    })
    
    enemies.forEach((enemy, index) => {
    enemy.update()
    const distan = Math.hypot (player.x -enemy.x, player.y - enemy.y )
    //end game
    if (distan - enemy.radius - player.radius < -1){
    cancelAnimationFrame(animationID)
    modal.style.display = 'flex'
    bigscorepoint.innerHTML = score
    }
    projectiles.forEach((projectile, projectileIndex) => {
        const dist = Math.hypot (projectile.x -enemy.x, projectile.y - enemy.y )
        //prjectiles touch enemy
        if (dist - enemy.radius - projectile.radius < 0){
        

        // tạo mảnh vỡ 
        for(let i = 0; i < enemy.radius * 2; i++){
            particles.push(
                new Particle(
                    projectile.x,
                    projectile.y,
                    Math.random()*2,
                    enemy.color,
                    {
                    x: (Math.random() - 0.5) * (Math.random() * 10),
                    y: (Math.random() - 0.5) * (Math.random() * 10)
                })
            )
        }
        // increase our score
        if(enemy.radius > 15){
            score += 100
            scorepoint.innerHTML = score
            gsap.to(enemy, {
                radius: enemy.radius - 10
            })
            // setTimeout(() => {
                projectiles.splice(projectileIndex, 1)
            // },0)
        } else {
            score += 250
            scorepoint.innerHTML = score
        // setTimeout(() => {
            enemies.splice(index, 1)
            projectiles.splice(projectileIndex, 1)
        // }, 0)
        }
        }
        })
    })
}
    
// thêm sự kiện click bắn đạn
window.addEventListener('click', (event) => {
    const angle = Math.atan2(
        event.clientY - canvas.height / 2,
        event.clientX - canvas.width /2)
    const velocity = {
        x: Math.cos(angle)*20,
        y: Math.sin(angle)*20
    }
    projectiles.push(new Projectile(canvas.width /2, canvas.height /2, 5, 'white', velocity ))
})
//thêm sự kiện click Start Game
startGameBt.addEventListener('click', () => {
    init()
    animate()
    spawnEnemies()
    modal.style.display = 'none'
}) 