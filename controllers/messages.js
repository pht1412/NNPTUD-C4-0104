
const Message = require('../schemas/messages');

exports.sendMessage = async (req, res) => {
  try {
    const { to, messageContent } = req.body;
    const from = req.user._id; // Assuming you have user info in req.user

    let content = {};

    if (req.file) {
      content.type = 'file';
      content.text = req.file.path;
    } else {
      content.type = 'text';
      content.text = messageContent.text;
    }

    const newMessage = new Message({
      from,
      to,
      messageContent: content
    });

    await newMessage.save();
    res.status(201).send(newMessage);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getMessagesWithUser = async (req, res) => {
  try {
    const { userID } = req.params;
    const currentUser = req.user._id;

    const messages = await Message.find({
      $or: [
        { from: currentUser, to: userID },
        { from: userID, to: currentUser }
      ]
    }).sort({ createdAt: 1 });

    res.status(200).send(messages);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getLastMessages = async (req, res) => {
  try {
    const currentUser = req.user._id;

    const lastMessages = await Message.aggregate([
      {
        $match: {
          $or: [{ from: currentUser }, { to: currentUser }]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: {
              if: { $eq: ['$from', currentUser] },
              then: '$to',
              else: '$from'
            }
          },
          lastMessage: { $first: '$$ROOT' }
        }
      },
      {
        $replaceRoot: { newRoot: '$lastMessage' }
      }
    ]);

    res.status(200).send(lastMessages);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};
