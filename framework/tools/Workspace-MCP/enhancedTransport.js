import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Enhanced SSE Server Transport with improved error handling and debugging
 * Extends the standard SSEServerTransport to provide better handling of connection issues
 */
class EnhancedSSEServerTransport extends SSEServerTransport {
  /**
   * Create a new EnhancedSSEServerTransport
   * @param {string} messagesPath - The path for posting messages
   * @param {object} res - Express response object
   */  constructor(messagesPath, res) {
    super(messagesPath, res);
    this._customSessionId = uuidv4();
    
    // Setup additional error handlers
    this._onError = this._onError.bind(this);
    res.on('error', this._onError);
    
    console.log(`Enhanced SSE transport created with session ID: ${this._customSessionId}`);
  }

  /**
   * Override start method from parent class to handle headers properly
   * @override
   */
  start() {
    // We won't set headers here as the base class will handle it
    console.log(`Starting enhanced SSE transport for session ${this._customSessionId}`);
    return super.start();
  }

  /**
   * Handle errors on the response stream
   * @param {Error} error - The error that occurred
   */  _onError(error) {
    console.error(`SSE transport error for session ${this._customSessionId}:`, error);
  }

  /**
   * Override to add additional error handling and logging
   * @param {object} message - The message to send
   */  async sendMessage(message) {
    try {
      if (!this._res || this._res.writableEnded) {
        console.error(`Cannot write to closed stream for session ${this._customSessionId}`);
        return;
      }
      
      // Convert message to string if needed
      const messageStr = typeof message === 'string' 
        ? message 
        : JSON.stringify(message);
      
      // Write the message with proper SSE formatting
      const success = this._res.write(`data: ${messageStr}\n\n`);
      
      if (!success) {
        console.warn(`Write buffer full for session ${this._customSessionId}, waiting for drain`);
        // Wait for the drain event before proceeding
        await new Promise(resolve => this._res.once('drain', resolve));
      }
    } catch (error) {
      console.error(`Error sending message for session ${this._customSessionId}:`, error);
      throw error;
    }
  }

  /**
   * Handle incoming POST messages
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async handlePostMessage(req, res) {
    try {
      let body = req.body;
      
      // Parse body if it's a string
      if (typeof body === 'string') {
        try {
          body = JSON.parse(body);
        } catch (e) {
          console.error('Failed to parse message body:', e);
          res.status(400).send('Invalid JSON in message body');
          return;
        }      }
      
      // Process the message
      console.log(`Processing incoming message for session ${this._customSessionId}`);
      await this.onmessage(body);
      
      // Send success response
      res.status(200).send('Message processed');
    } catch (error) {
      console.error(`Error handling message for session ${this._customSessionId}:`, error);
      if (!res.headersSent) {
        res.status(500).send(`Error processing message: ${error.message}`);
      }    }
  }
}

// Export the EnhancedSSEServerTransport class
export { EnhancedSSEServerTransport };
