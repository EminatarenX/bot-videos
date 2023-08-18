const cron = require('node-cron')
const {PrismaClient} = require('@prisma/client')
const { s3, BUCKET_NAME, ENDPOINT } = require('./s3')
const { ListObjectsCommand, GetObjectCommand } = require('@aws-sdk/client-s3')
const fs = require('fs')


const prisma = new PrismaClient()

const listParams = {
  Bucket: BUCKET_NAME,
  Prefix: 'videos/'
}


async function iniciarTareas () {
  cron.schedule('* * * * *', async() => {
    console.log('Ejecutando tarea cada minuto')

    try {

      const { Contents } = await s3.send(new ListObjectsCommand(listParams))

      let urls = []
      // llenando el arreglo de urls con los videos que se encuentran en el bucket
      Contents.forEach(content => {
        const url = `${ENDPOINT}/${content.Key}`
        urls.push(url)
      })

      // filtrando los videos que ya estan en la base de datos
      const videos = await prisma.video.findMany({
        where: {
          url: {
            in: urls
          }
        }
      })

      // si la cantidad de videos en la base de datos es igual a la cantidad de videos en el bucket
      // significa que ya se subieron los videos a la base de datos y probablemente a tiktok

      if(videos.length === urls.length){
        console.log('Ya hay videos con ese nombre en la base de datos')
        return 
      }

      const videoNuevo = await prisma.video.create({
        data: {
          url: urls[urls.length - 1]
        }
      })


      console.log({msg:'Se agregaron los videos a la base de datos', videoNuevo})

      const nombreArchivo = urls[urls.length - 1].replace(`${ENDPOINT}/`, '')

      descargarVideo(nombreArchivo)
      
    } catch (error) {
      console.log(error)
    }finally{
      prisma.$disconnect()
    }

    
    
  })
}

async function descargarVideo (nombreArchivo) {
  const downloadParams = {
    Bucket: BUCKET_NAME,
    Key: nombreArchivo
  }

  try {

    const data = await s3.send(new GetObjectCommand(downloadParams))
    
    console.log(data)
    

  } catch (error) {
    console.log(error)
  }

}

module.exports = {
  iniciarTareas
}