
const fs = require("fs");
const { google } = require("googleapis");

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;

const oath2Client = new google.auth.OAuth2(
CLIENT_ID,
CLIENT_SECRET,
REDIRECT_URI
);

oath2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const drive = google.drive({ version: "v3", auth: oath2Client });


const driveService = async (req,res,next)=>{
    const {path , originalname,mimetype} = req.file;

try {
    const response = await drive.files.create({
      requestBody: {
        name: originalname,
        mimeType: mimetype
      },
      media: {
        mimeType: mimetype,
        body: fs.createReadStream(path),
      },
    });
    res.status(200).json({ 'link' : response.data.id.toString()});
  } catch (error) {
    next(error);
  }finally{
      fs.unlinkSync(path);
  }

}


module.exports = {driveService};