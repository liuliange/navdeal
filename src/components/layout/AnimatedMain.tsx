'use client'

import { motion } from 'framer-motion'

export default function AnimatedMain({ children }: { children: React.ReactNode }) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex-1 w-0 min-w-0 flex flex-col"
    >
      {children}
    </motion.main>
  )
}