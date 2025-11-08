import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

// Email configuration interface
interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

// Email data interface
interface EmailData {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

// Order data interface for email templates
interface OrderEmailData {
  user: { email: string };
  orderNumber: string;
  totalAmount: number;
  items: Array<{
    product: { name: string };
    quantity: number;
    price: number;
  }>;
}

class EmailService {
  private transporter: Transporter | null = null;
  private config: EmailConfig;
  private fromName: string;
  private fromAddress: string;

  constructor() {
    this.config = {
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASS || '',
      },
    };
    
    this.fromName = process.env.EMAIL_FROM_NAME || 'Wizza Store';
    this.fromAddress = process.env.EMAIL_FROM_ADDRESS || 'noreply@wizza.com';
    
    this.initializeTransporter();
  }

  private initializeTransporter(): void {
    try {
      this.transporter = nodemailer.createTransport(this.config);
      console.log('Email transporter initialized successfully');
    } catch (error) {
      console.error('Failed to initialize email transporter:', error);
      throw new Error('Email service initialization failed');
    }
  }

  private validateConfig(): boolean {
    const { user, pass } = this.config.auth;
    if (!user || !pass) {
      console.error('Email configuration is incomplete. Please check EMAIL_USER and EMAIL_PASS environment variables.');
      return false;
    }
    return true;
  }

  private generateOrderConfirmationHTML(orderData: OrderEmailData): string {
    const { orderNumber, totalAmount, items } = orderData;
    
    const itemsHTML = items.map(item => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.product.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">$${item.price.toFixed(2)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">$${(item.quantity * item.price).toFixed(2)}</td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation - ${orderNumber}</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">${this.fromName}</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Order Confirmation</p>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-top: 0;">Thank you for your order!</h2>
          
          <p>We&apos;re excited to confirm that we&apos;ve received your order and it&apos;s being processed.</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #495057;">Order Details</h3>
            <p><strong>Order Number:</strong> ${orderNumber}</p>
            <p><strong>Total Amount:</strong> $${totalAmount.toFixed(2)}</p>
          </div>
          
          <h3>Items Ordered:</h3>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background: #f8f9fa;">
                <th style="padding: 12px 8px; text-align: left; border-bottom: 2px solid #dee2e6;">Product</th>
                <th style="padding: 12px 8px; text-align: center; border-bottom: 2px solid #dee2e6;">Qty</th>
                <th style="padding: 12px 8px; text-align: right; border-bottom: 2px solid #dee2e6;">Price</th>
                <th style="padding: 12px 8px; text-align: right; border-bottom: 2px solid #dee2e6;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
            <tfoot>
              <tr style="background: #f8f9fa; font-weight: bold;">
                <td colspan="3" style="padding: 12px 8px; text-align: right; border-top: 2px solid #dee2e6;">Total:</td>
                <td style="padding: 12px 8px; text-align: right; border-top: 2px solid #dee2e6;">$${totalAmount.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
          
          <div style="background: #e7f3ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h4 style="margin-top: 0; color: #0066cc;">What&apos;s Next?</h4>
            <p style="margin-bottom: 0;">We&apos;ll send you another email with tracking information once your order ships. If you have any questions, please don&apos;t hesitate to contact our customer service team.</p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 14px;">Thank you for choosing ${this.fromName}!</p>
            <p style="color: #666; font-size: 12px;">This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async sendEmail(emailData: EmailData, retries: number = 3): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.validateConfig()) {
      return { success: false, error: 'Email configuration is invalid' };
    }

    if (!this.transporter) {
      return { success: false, error: 'Email transporter not initialized' };
    }

    const mailOptions = {
      from: `"${this.fromName}" <${this.fromAddress}>`,
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
    };

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`Attempting to send email (attempt ${attempt}/${retries}) to: ${emailData.to}`);
        
        const info = await this.transporter.sendMail(mailOptions);
        
        console.log('Email sent successfully:', {
          messageId: info.messageId,
          to: emailData.to,
          subject: emailData.subject,
          attempt,
        });
        
        return { success: true, messageId: info.messageId };
      } catch (error) {
        console.error(`Email sending attempt ${attempt} failed:`, {
          error: error instanceof Error ? error.message : 'Unknown error',
          to: emailData.to,
          subject: emailData.subject,
        });
        
        if (attempt === retries) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          console.error('All email sending attempts failed:', errorMessage);
          return { success: false, error: errorMessage };
        }
        
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }

    return { success: false, error: 'All retry attempts exhausted' };
  }

  async sendOrderConfirmationEmail(orderData: OrderEmailData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const subject = `Order Confirmation - ${orderData.orderNumber}`;
      const html = this.generateOrderConfirmationHTML(orderData);
      
      const emailData: EmailData = {
        to: orderData.user.email,
        subject,
        html,
      };
      
      console.log('Preparing to send order confirmation email:', {
        to: orderData.user.email,
        orderNumber: orderData.orderNumber,
        totalAmount: orderData.totalAmount,
        itemCount: orderData.items.length,
      });
      
      return await this.sendEmail(emailData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Error preparing order confirmation email:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  async verifyConnection(): Promise<boolean> {
    if (!this.transporter) {
      console.error('Email transporter not initialized');
      return false;
    }

    try {
      await this.transporter.verify();
      console.log('Email service connection verified successfully');
      return true;
    } catch (error) {
      console.error('Email service connection verification failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const emailService = new EmailService();
export default emailService;