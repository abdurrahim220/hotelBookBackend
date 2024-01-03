import express, { Request, Response } from "express";
import multer from 'multer'
import cloudinary from 'cloudinary'
import Hotel, { HotelType } from "../models/hotel";
import { body } from "express-validator";
import verifyToken from "../middleware/auth";


const router = express.Router();


const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
});

// create api routes for my-hotels
router.post('/',
    [
        body("name").notEmpty().withMessage("Name is required"),
        body("city").notEmpty().withMessage("City is required"),
        body("country").notEmpty().withMessage("Country is required"),
        body("description").notEmpty().withMessage("Description is required"),
        body("type").notEmpty().withMessage("Hotel type is required"),
        body("pricePerNight")
            .notEmpty()
            .isNumeric()
            .withMessage("Price per night is required and must be a number"),
        body("facilities")
            .notEmpty()
            .isArray()
            .withMessage("Facilities are required"),
    ], verifyToken,
    upload.array("imageFiles", 6), async (req: Request, res: Response) => {

        try {
            const imageFiles = req.files as Express.Multer.File[];

            const newHotel: HotelType = req.body;



            const imageUrls = await uploadImages(imageFiles);



            newHotel.imageUrls = imageUrls;
            newHotel.lastUpdated = new Date();
            newHotel.userId = req.userId;
            const hotel = new Hotel(newHotel)
            await hotel.save()
            res.status(201).send(hotel)
            // console.log(hotel)

        } catch (error) {

            res.status(500).json({ message: "Something went wrong" })
        }
    })



router.get('/', verifyToken, async (req: Request, res: Response) => {
    try {
        const hotels = await Hotel.find({ userId: req.userId });
        res.json(hotels)
    } catch (error) {
        res.status(500).json({ message: "Error fetching hotels" })
    }
})


router.get("/:id", verifyToken, async (req: Request, res: Response) => {
    const id = req.params.id.toString();
    try {
        const hotel = await Hotel.findOne({
            _id: id,
            userId: req.userId
        })
        res.json(hotel)
    } catch (error) {
        res.status(500).json({ message: "Error fetching hotels" })
    }
})


router.put("/:hotelId", verifyToken, upload.array("imageFiles"), async (req: Request, res: Response) => {
    try {
        const updatedHotel: HotelType = req.body;

        
        updatedHotel.lastUpdated = new Date();
        

        const hotel = await Hotel.findOneAndUpdate({
            _id: req.params.hotelId,
            userId: req.userId,
        }, updatedHotel, { new: true })

        if (!hotel) {
            return res.status(404).json({ message: "Hotel not found" });
        }

       

        const files = req.files as Express.Multer.File[];
        console.log("files",files)

        const updateImageUrls = await uploadImages(files);
        console.log("Update:::",updateImageUrls)

        hotel.imageUrls = [...updateImageUrls, ...(updatedHotel.imageUrls || [])];

        await hotel.save();

        res.status(201).json(hotel);


    } catch (error) {
        res.status(500).json({ message: "Something Went Wrong" })
    }
})



async function uploadImages(imageFiles: Express.Multer.File[]) {
    const uploadPromises = imageFiles.map(async (image) => {
        const b64 = Buffer.from(image.buffer).toString("base64");
        let dataURL = "data:" + image.mimetype + ";base64," + b64;
        try {
            const res = await cloudinary.v2.uploader.upload(dataURL);

            return res.url;
        } catch (error) {
            console.error("Error uploading image to Cloudinary:", error);
            throw error;
        }
    });



    const imageUrls = await Promise.all(uploadPromises);
    return imageUrls;
}

export default router;