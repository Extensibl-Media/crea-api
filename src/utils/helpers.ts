import { CREAAgentData, CREARoomData } from './types';

export const chunkArray = (arr, size) =>
  arr.length > size
    ? [arr.slice(0, size), ...chunkArray(arr.slice(size), size)]
    : [arr];

export const getFilteredRoomData = (rooms: CREARoomData[]) => {
  return rooms
    .map(
      (room) =>
        `<p>${room.RoomType}${
          room.RoomDimensions ? ` <strong>${room.RoomDimensions}</strong>` : ''
        }</p>`
    )
    .join('');
};

export const formatAgentData = (agent: CREAAgentData | null) => {
  if (!agent) {
    return null;
  }
  return `
  <p>${agent.MemberKey}</p>
  <p>${agent.MemberFirstName} ${agent.MemberLastName}</p>
  ${agent.MemberOfficePhone ? `<p>${agent.MemberOfficePhone}</p>` : ''}
  ${agent.MemberSocialMedia.map((m) => `<p>${m.SocialMediaUrlOrId}</p>`)}
  <p>${agent.ModificationTimestamp}</p> 
  ${agent.office.OfficeName ? `<p>${agent.office.OfficeName}</p>` : ''}
  ${agent.office.OfficeAddress1 ? `<p>${agent.office.OfficeAddress1}</p>` : ''}
  ${agent.office.OfficeAddress2 ? `<p>${agent.office.OfficeAddress2}</p>` : ''}
  ${agent.office.OfficeCity ? `<p>${agent.office.OfficeCity}</p>` : ''}
  ${
    agent.office.OfficeStateOrProvince
      ? `<p>${agent.office.OfficeStateOrProvince}</p>`
      : ''
  }
  ${agent.office.OfficePhone ? `${agent.office.OfficePhone}` : ''}
  ${agent.office.OfficeType ? `<p>${agent.office.OfficeType}</p>` : ''}
${
  agent.office.ModificationTimestamp
    ? `<p>${agent.office.ModificationTimestamp}</p>`
    : ''
}
  `;
};

export const slugify = (string: string) => {
  return string
    .toLowerCase() // Convert to lowercase
    .replace(/[^a-z0-9\s-]/g, '') // Remove non-alphanumeric characters except spaces and hyphens
    .replace(/[\s-]+/g, '-') // Replace spaces and hyphens with a single hyphen
    .trim(); // Trim leading/trailing spaces
};
