import aj from '../config/arcjet.js'

const arcjetMiddleware = async (req, res, next) => {
    try{
        if(!req.path.startsWith('/api/v1') || req.path.startsWith('/api/v1/workflow')){
            return next();
        }

        const decision = await aj.protect(req, { requested: 1  });

        if(decision.isDenied()) { 
            if(decision.reason.isRateLimit()) {
                return res.status(429).json({ error:'Rate limit exceeded' });
            }
            if(decision.reason.isBot()) {
                return res.status(403).json({ error: 'Access denied' });
            }
            return res.status(403).json({ error: 'Forbidden' });
        }

        next();

    } catch (error) {
        console.log(`Arcjet Middleware Error: ${error}`);
        next(error);
    }
}

export default arcjetMiddleware;
