import { Request, Response } from "express";
import Stripe from 'stripe';  // Import Stripe using ES module syntax
import config from "../config";

const stripe = new Stripe(config.stripe.stripe_secret_key as string); 
const  createConnectedAccountAndOnboardingLink =async(req:Request,res:Response) => {
    const salonEmail = req.body.email;
    try {
      // Step 1: Create a connected account
      const account = await stripe.accounts.create({
        type: 'express',  // or 'express' based on your need
        email: salonEmail,
        country: 'DE', // Example country
      });
      
      console.log("Connected Account Created:", account.id);
  
      // Step 2: Create the onboarding link
      const onboardingLink = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: 'https://yourapp.com/reauth', // URL to re-authenticate if the process fails
        return_url: 'https://yourapp.com/success', // URL to go after successful setup
        type: 'account_onboarding',
      });
      

      res.json({
        status:200,
        success:true,
        data:onboardingLink.url
      })
      return onboardingLink.url;
    } catch (error) {
      console.log("Error:", error);
      throw error;
    }
  }


  export default createConnectedAccountAndOnboardingLink;