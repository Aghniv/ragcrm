import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8085/api';

function ContactPage() {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      company: '',
      source: 'Website',
      notes: ''
    }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/leads`, data);
      toast.success('Thank you! Your message has been submitted. We will contact you soon.');
      reset();
    } catch (error) {
      console.error('Error submitting lead:', error);
      toast.error('Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">
      <div className="contact-container">
        <div className="contact-header">
          <h1>Get In Touch</h1>
          <p>Fill out the form below and we'll get back to you as soon as possible.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="contact-form" noValidate>
          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <input
              id="name"
              type="text"
              {...register('name', { required: 'Name is required', maxLength: { value: 255, message: 'Name must not exceed 255 characters' } })}
              className={errors.name ? 'error' : ''}
              placeholder="John Doe"
            />
            {errors.name && <span className="error-message">{errors.name.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              id="email"
              type="email"
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email format' }
              })}
              className={errors.email ? 'error' : ''}
              placeholder="john@example.com"
            />
            {errors.email && <span className="error-message">{errors.email.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              id="phone"
              type="tel"
              {...register('phone', { maxLength: { value: 50, message: 'Phone must not exceed 50 characters' } })}
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div className="form-group">
            <label htmlFor="company">Company</label>
            <input
              id="company"
              type="text"
              {...register('company', { maxLength: { value: 255, message: 'Company must not exceed 255 characters' } })}
              placeholder="Your Company Name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="notes">Message *</label>
            <textarea
              id="notes"
              {...register('notes', {
                required: 'Message is required',
                maxLength: { value: 5000, message: 'Message must not exceed 5000 characters' }
              })}
              className={errors.notes ? 'error' : ''}
              rows="5"
              placeholder="Tell us about what you're interested in..."
            />
            {errors.notes && <span className="error-message">{errors.notes.message}</span>}
          </div>

          <button type="submit" className="btn-primary submit-btn" disabled={loading}>
            {loading ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ContactPage;