class Sprite {
    constructor({position, imageSrc, scaled = 1, offset = {x:0, y:0}}) {
        this.position = position
        this.width = 50
        this.height = 150
        this.image = new Image()
        this.image.src = imageSrc
        this.scale = scaled
        this.offset = offset

        this.image.onload = () => {
            this.loaded = true; 
        }
    }

    draw() {
        if (this.loaded) {
            if (this.loaded) {
                c.drawImage(
                    this.image,
                    0,
                    0,
                    canvas.width,
                    canvas.height
                )
            }
        }
    }
}
