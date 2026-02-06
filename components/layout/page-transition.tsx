"use client"

import { motion } from "framer-motion"
import { usePathname } from "next/navigation"

const variants = {
  initial: {
    opacity: 0,
    y: 6,
  },
  animate: {
    opacity: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    y: -4,
  },
}

const transition = {
  duration: 0.25,
  ease: [0.25, 0.46, 0.45, 0.94],
}

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <motion.div
      key={pathname}
      initial="initial"
      animate="animate"
      variants={variants}
      transition={transition}
      className="min-h-0 flex-1"
    >
      {children}
    </motion.div>
  )
}
