const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d')

canvas.width = 1000
canvas.height = 600

const background = new Sprite({
    position: {
        x: 0,
        y: 0
    },
})

function animate(){
    c.fillRect(0, 0, this.width, this.height)
    background.draw()
    requestAnimationFrame(animate)
}


animate()