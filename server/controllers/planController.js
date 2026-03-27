 const plans = [
    {
        id: 1, 
        name: "Free",
        price: "0",
        credits: "100",
        plan: "Your current plan",
        description: "Your current plan",
        features: [
          "Access to GPT-5",
          "Standard voice mode",
          "Real time data from web",
          "Limited access to file uploads",
          "Use custom GPTs"
        ],
        popular: false,
      },
      {
        id: 2,
        name: "Basic",
        price: "1499",
        credits: "500",
        plan: "Upgrade to Basic plan",
        description: "Basic features for personal use",
        features: [
          "Everything in free",
          "Extended access to our flagship model GPT-5",
          "Extended access to image generation",
          "Extended access to file uploads",
          "Extended access to advanced data analysis",
          "Longer memory for more personalized responses",
        ],
        popular: false,
      },
      {
        id: 3,
        name: "Pro",
        price: "3999",
        credits: "2000",
        plan: "Upgrade to Pro Plan",
        description: "Basic features for personal use",
        features: [
          "Everything in free",
          "Extended limits on GPT-5, our flagship model",
          "Create and use tasks, shared projects, and custom GPTs",
          "Limited access to Sora video generation",
          "Opportunities to test new features",
          "Access to a research preview of Codex agent",
          "Access to a research preview of Codex agent",
        ],
        popular: false,
      },
]

// API controller to get all plans

export const getPlans = async ( req, res ) => {
    try {
        res.json({success: true, plans})
    } catch (error) {
        
    }
}

// API controller to purchase a plan

export const purchasePlan = async ( req, res ) => {
    try {
        const planId = req.body;
        const userId = req.user.id;
        
        const plan = plans.find(plan => plan.id === planId)

        if(!plan){
            return res.json({success: false, message: "invalid plan"})
        }
    } catch (error) {
        return res.json({success: false, message: error.message})
    }
}