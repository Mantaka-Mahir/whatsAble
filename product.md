# AutoEngage - WhatsApp Follow-up Engine

## Overview
AutoEngage is a system for businesses to automatically send and manage follow-up messages when customers don't respond to initial communications. It demonstrates full-stack development skills using React, Node.js, Flutter and automation tools.

## Target Audience
- Small businesses (salons, gyms, tutors)
- E-commerce stores
- Service providers

## Problem Statement
Businesses lose potential customers when they fail to follow up after initial contact. Manual follow-up is time-consuming and inconsistent.

## Solution
A system that automatically:
1. Sends initial messages to customers
2. Tracks if customers have replied
3. Sends follow-up messages after a set time if no reply
4. Provides analytics on response rates

## Technical Stack
- Frontend: React.js admin dashboard
- Backend: Node.js with Express
- Mobile: Flutter app with WhatsApp-style UI
- Automation: n8n (open source alternative to Zapier)
- Database: Firebase/MongoDB (free tier)
- Messaging Simulation: UI in Flutter + backend logging

## Core Features
1. Admin Dashboard
   - Send messages to customers
   - View message history and status
   - Configure follow-up timing
   
2. Backend API
   - Webhook endpoint for n8n
   - Message storage and retrieval
   - Follow-up scheduling
   
3. Mobile App
   - WhatsApp-style inbox for customers
   - Message notifications
   - Reply functionality

4. Automation Flow
   - Google Form/Sheet trigger → n8n → backend → message
   - Timed follow-up if no response

## MVP Scope
- Basic admin panel with message sending
- Simple Flutter app with inbox
- Follow-up automation with fixed 30-second delay (for demo)
- Message log with read/unread status