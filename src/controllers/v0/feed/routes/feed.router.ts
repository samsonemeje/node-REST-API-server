import { Router, Request, Response } from 'express';
import FeedItem from '../models/FeedItem';
import { requireAuth } from '../../users/routes/auth.router';
import * as AWS from '../../../../aws';



const router: Router = Router();

// Get all feed items
router.get('/', async (req: Request, res: Response) => {
  try {
    const items = await FeedItem.findAndCountAll({ order: [['id', 'DESC']] });

    // Check if items exist and have rows
    if (items && items.rows) {
      // Use forEach instead of map to mutate the original array
      items.rows.forEach((item: FeedItem) => {
        if (item.url) {
          item.url = AWS.getGetSignedUrl(item.url);
        }
      });

      res.send(items);
    } else {
      // Handle case where items or items.rows is null or undefined
      res.status(404).send({ message: 'No items found' });
    }
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).send({ message: 'Internal server error' });
  }
});

// Get a specific feed item by Primary Key
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // Validate if id is present
    if (!id) {
      return res.status(400).send({ message: 'ID is required' });
    }

    const item = await FeedItem.findByPk(id);

    if (!item) {
      return res.status(404).send({ message: 'Item not found' });
    }

    res.send(item);
  } catch (error) {
    console.error('Error fetching item by ID:', error);
    res.status(500).send({ message: 'Internal server error' });
  }
});


// Update a specific resource
router.patch('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { caption, url } = req.body;

    // Validate if id is present
    if (!id) {
      return res.status(400).send({ message: 'ID is required' });
    }

    // Find the item by ID
    const item = await FeedItem.findByPk(id);

    if (!item) {
      return res.status(404).send({ message: 'Item not found' });
    }

    // Update the item with the new data
    if (caption) {
      item.caption = caption;
    }
    if (url) {
      item.url = url;
    }

    // Save the updated item
    const updatedItem = await item.save();

    // Return the updated item
    res.send(updatedItem);
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).send({ message: 'Internal server error' });
  }
});


// Get a signed url to put a new item in the bucket
router.get('/signed-url/:fileName',
  requireAuth,
  async (req: Request, res: Response) => {
    let { fileName } = req.params;
    const url = AWS.getPutSignedUrl(fileName);
    res.status(201).send({ url: url });
  });

// Post meta data and the filename after a file is uploaded 
// NOTE the file name is the key name in the s3 bucket.
// body : {caption: string, fileName: string};
router.post('/',
  requireAuth,
  async (req: Request, res: Response) => {
    const caption = req.body.caption;
    const fileName = req.body.url;

    // check Caption is valid
    if (!caption) {
      return res.status(400).send({ message: 'Caption is required or malformed' });
    }

    // check Filename is valid
    if (!fileName) {
      return res.status(400).send({ message: 'File url is required' });
    }

    const item = await new FeedItem({
      caption: caption,
      url: fileName
    });

    const saved_item = await item.save();

    saved_item.url = AWS.getGetSignedUrl(saved_item.url);
    res.status(201).send(saved_item);
  });

// Delete a specific feed item by Primary Key
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const item = await FeedItem.findByPk(id);

    if (!item) {
      return res.status(404).send({ message: 'Item not found' });
    }

    await item.destroy();

    res.status(204).send({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).send({ message: 'Internal server error' });
  }
});

export const FeedRouter: Router = router;
