import { Link as RouterLink } from 'react-router-dom'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'

interface PageBreadcrumbsProps {
  /** Label for the current (non-home) page, e.g. "Upload", "Profile", or a video's title. */
  current: string
}

/** Home > {current} -- shown at the top of every page except the homepage itself. */
export function PageBreadcrumbs({ current }: PageBreadcrumbsProps) {
  return (
    <Breadcrumbs sx={{ mb: 2 }}>
      <Link
        component={RouterLink}
        to="/"
        underline="hover"
        sx={(theme) => ({
          color: theme.palette.mode === 'dark' ? '#ffffff' : theme.palette.primary.main,
        })}
      >
        Home
      </Link>
      <Typography color="text.secondary" noWrap sx={{ maxWidth: 320 }}>
        {current}
      </Typography>
    </Breadcrumbs>
  )
}
