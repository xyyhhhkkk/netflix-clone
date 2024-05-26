import bcrypt from 'bcrypt';
import { NextApiRequest, NextApiResponse } from 'next';
import prismadb from '@/lib/prismadb';
import { responseEncoding } from 'axios';

export default async function handler(req: NextApiRequest,res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
          const { email, name, password } = req.body;
    
          // 查找唯一的用户
          const existingUser = await prismadb.user.findUnique({
            where: {
              email: email,
            },
          });

          if (existingUser) {
            res.status(400).json({ error: 'User already exists' });
            return;
          }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await prismadb.user.create({
            data: {
                email,
                name,
                hashedPassword,
                image: '',
                emailVerified: new Date(),
            }
        });
        return res.status(200).json(user)
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'An error occurred while registering the user.' });
    }
} else{
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}